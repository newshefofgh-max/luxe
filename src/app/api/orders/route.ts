export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, getAuthUser, AuthError } from '@/lib/auth';
import { checkoutSchema } from '@/lib/validators';
import { orderRateLimit, getClientIP } from '@/lib/rateLimit';
import { calculateShippingFee } from '@/lib/shipping';
import { sendOrderConfirmationToCustomer, sendOrderNotificationToAdmin } from '@/lib/whatsapp';
import type { IOrder } from '@/types';

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try { body = await req.json(); } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    const data = parsed.data;

    const ip = getClientIP(req);
    const rl = orderRateLimit(ip);
    if (!rl.allowed) return NextResponse.json({ error: 'Too many orders from this IP.', resetAt: new Date(rl.resetAt).toISOString() }, { status: 429 });

    // Duplicate check
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const duplicate = await db.order.findFirst({
      where: { customerPhone: data.phone, customerAddress: data.address, createdAt: { gte: oneDayAgo }, NOT: { status: 'cancelled' } },
    });
    if (duplicate) return NextResponse.json({ error: 'A similar order was placed in the last 24 hours.', duplicateOrderNumber: duplicate.orderNumber }, { status: 409 });

    const rawBody = body as Record<string, unknown>;
    const clientItems = Array.isArray(rawBody.items)
      ? (rawBody.items as Array<{ productId: string; quantity: number; selectedVariant?: string }>)
      : [];
    if (clientItems.length === 0) return NextResponse.json({ error: 'Order must contain at least one item' }, { status: 400 });

    const dbProducts = await db.product.findMany({
      where: { id: { in: clientItems.map((i) => i.productId) }, isActive: true },
    });
    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    for (const item of clientItems) {
      const product = productMap.get(item.productId);
      if (!product) return NextResponse.json({ error: `Product "${item.productId}" is not available` }, { status: 400 });
      if (product.stock < item.quantity) return NextResponse.json({ error: `Insufficient stock for "${product.name}". Available: ${product.stock}` }, { status: 400 });
    }

    const orderItems = clientItems.map((item) => {
      const p = productMap.get(item.productId)!;
      return { productId: p.id, productName: p.name, productNameAr: p.nameAr, image: (JSON.parse(p.images) as string[])[0] ?? '', price: p.price, quantity: item.quantity, selectedVariants: JSON.stringify(item.selectedVariant ? { variant: item.selectedVariant } : {}) };
    });

    const subtotal = orderItems.reduce((s, i) => s + i.price * i.quantity, 0);

    let couponDiscount = 0;
    let couponCode: string | undefined;
    let appliedCoupon: { id: string; code: string; maxUses: number | null; usedCount: number; discountType: string; discountValue: number } | null = null;

    if (data.couponCode) {
      appliedCoupon = await db.coupon.findFirst({ where: { code: data.couponCode.toUpperCase(), isActive: true } });
      if (!appliedCoupon) return NextResponse.json({ error: 'Invalid or expired coupon code' }, { status: 400 });
      if (appliedCoupon.maxUses && appliedCoupon.usedCount >= appliedCoupon.maxUses) return NextResponse.json({ error: 'This coupon has reached its usage limit' }, { status: 400 });
      couponDiscount = appliedCoupon.discountType === 'percentage'
        ? Math.round((subtotal * appliedCoupon.discountValue) / 100)
        : Math.min(appliedCoupon.discountValue, subtotal);
      couponCode = appliedCoupon.code;
    }

    const shippingFee = calculateShippingFee(data.governorate);
    const total = subtotal - couponDiscount + shippingFee;
    const authUser = getAuthUser(req);

    // Generate orderNumber
    const year = new Date().getFullYear();
    const count = await db.order.count();
    const orderNumber = `ORD-${year}-${String(count + 1).padStart(6, '0')}`;

    // Create order + items in a transaction
    const order = await db.$transaction(async (tx) => {
      const o = await tx.order.create({
        data: {
          orderNumber,
          customerName: data.fullName,
          customerPhone: data.phone,
          customerEmail: data.email ?? undefined,
          customerGov: data.governorate,
          customerCity: data.city,
          customerAddress: data.address,
          userId: authUser?.userId ?? undefined,
          subtotal,
          shippingFee,
          discount: couponDiscount,
          total,
          paymentMethod: data.paymentMethod,
          notes: data.notes,
          couponCode,
          ipAddress: ip,
          items: { create: orderItems },
          statusHistory: { create: [{ status: 'pending', note: 'Order placed by customer' }] },
        },
      });

      // Deduct stock
      for (const item of clientItems) {
        await tx.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity }, sold: { increment: item.quantity } } });
      }

      // Atomic coupon increment
      if (appliedCoupon) {
        const couponWhere = appliedCoupon.maxUses
          ? { id: appliedCoupon.id, usedCount: { lt: appliedCoupon.maxUses } }
          : { id: appliedCoupon.id };
        await tx.coupon.updateMany({ where: couponWhere, data: { usedCount: { increment: 1 } } });
      }

      return o;
    });

    // WhatsApp (fire-and-forget)
    const whatsappOrder: IOrder = {
      _id: order.id, orderNumber: order.orderNumber,
      customer: { fullName: data.fullName, phone: data.phone, email: data.email ?? undefined, governorate: data.governorate, city: data.city, address: data.address, userId: authUser?.userId },
      items: orderItems.map((i) => ({ productId: i.productId, productName: i.productName, productNameAr: i.productNameAr, image: i.image, price: i.price, quantity: i.quantity })),
      subtotal, shippingFee, discount: couponDiscount, total, status: 'pending', statusHistory: [], paymentMethod: data.paymentMethod as 'cod', notes: data.notes, couponCode, otpVerified: false, createdAt: order.createdAt.toISOString(), updatedAt: order.updatedAt.toISOString(),
    };
    Promise.all([sendOrderConfirmationToCustomer(whatsappOrder), sendOrderNotificationToAdmin(whatsappOrder)]).catch(console.error);

    return NextResponse.json({ data: { orderNumber: order.orderNumber, orderId: order.id, status: order.status, total, shippingFee, discount: couponDiscount, estimatedDelivery: '3-7 business days', message: 'Order placed successfully!' } }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/orders]', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    requireAdmin(req);
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)));
    const skip = (page - 1) * limit;
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const governorate = searchParams.get('governorate');
    const paymentMethod = searchParams.get('paymentMethod');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (governorate) where.customerGov = governorate;
    if (paymentMethod) where.paymentMethod = paymentMethod;
    if (search) {
      where.OR = [
        { customerPhone: { contains: search } },
        { orderNumber: { contains: search.toUpperCase() } },
        { customerName: { contains: search } },
      ];
    }
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) (where.createdAt as Record<string, unknown>).gte = new Date(dateFrom);
      if (dateTo) { const e = new Date(dateTo); e.setHours(23,59,59,999); (where.createdAt as Record<string, unknown>).lte = e; }
    }

    const sortBy = searchParams.get('sortBy') ?? 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') ?? 'desc') as 'asc' | 'desc';
    const allowedSortFields: Record<string, unknown> = { createdAt: true, total: true, orderNumber: true, status: true };
    const orderBy = allowedSortFields[sortBy] ? { [sortBy]: sortOrder } : { createdAt: 'desc' as const };

    const [orders, total] = await Promise.all([
      db.order.findMany({ where, orderBy, skip, take: limit, include: { items: true, statusHistory: true } }),
      db.order.count({ where }),
    ]);

    const shaped = orders.map((o) => ({
      ...o, _id: o.id,
      customer: { fullName: o.customerName, phone: o.customerPhone, email: o.customerEmail, governorate: o.customerGov, city: o.customerCity, address: o.customerAddress, userId: o.userId },
      items: o.items.map((i) => ({ ...i, _id: i.id, selectedVariants: JSON.parse(i.selectedVariants) })),
      statusHistory: o.statusHistory,
    }));

    return NextResponse.json({ success: true, data: shaped, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error('[GET /api/orders]', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
