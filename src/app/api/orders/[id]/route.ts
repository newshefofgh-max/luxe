export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, getAuthUser, AuthError } from '@/lib/auth';
import { sendOrderStatusUpdate } from '@/lib/whatsapp';
import { createBostaShipment } from '@/lib/shipping';
import type { IOrder } from '@/types';

type RouteContext = { params: { id: string } };

const STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

function shapeOrder(o: Record<string, unknown>, items: unknown[], statusHistory: unknown[]) {
  return {
    ...o, _id: o.id,
    customer: { fullName: o.customerName, phone: o.customerPhone, email: o.customerEmail, governorate: o.customerGov, city: o.customerCity, address: o.customerAddress, userId: o.userId },
    items, statusHistory,
  };
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = params;
    const order = await db.order.findFirst({
      where: { OR: [{ id }, { orderNumber: id.toUpperCase() }] },
      include: { items: true, statusHistory: { orderBy: { timestamp: 'asc' } } },
    });
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    const authUser = getAuthUser(req);
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (authUser.role !== 'admin') {
      if (!order.userId || order.userId !== authUser.userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const items = order.items.map((i) => ({ ...i, _id: i.id, selectedVariants: JSON.parse(i.selectedVariants) }));
    return NextResponse.json({ success: true, data: shapeOrder(order as unknown as Record<string, unknown>, items, order.statusHistory) });
  } catch (error) {
    console.error('[GET /api/orders/[id]]', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    requireAdmin(req);
    const { id } = params;

    const order = await db.order.findUnique({ where: { id }, include: { items: true } });
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    let body: Record<string, unknown>;
    try { body = await req.json(); } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const newStatus = body.status as string | undefined;
    const note = body.note as string | undefined;
    const trackingNumber = body.trackingNumber as string | undefined;
    const cancelReason = body.cancelReason as string | undefined;

    // Tracking-number-only update (no status change)
    if (!newStatus && trackingNumber !== undefined) {
      await db.order.update({ where: { id }, data: { trackingNumber } });
      const updated = await db.order.findUnique({ where: { id }, include: { items: true, statusHistory: { orderBy: { timestamp: 'asc' } } } });
      if (!updated) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      const updatedItems = updated.items.map((i) => ({ ...i, _id: i.id, selectedVariants: JSON.parse(i.selectedVariants) }));
      return NextResponse.json({ success: true, data: shapeOrder(updated as unknown as Record<string, unknown>, updatedItems, updated.statusHistory) });
    }

    if (!newStatus) return NextResponse.json({ error: 'status field is required' }, { status: 400 });

    const allowed = STATUS_TRANSITIONS[order.status] ?? [];
    if (!allowed.includes(newStatus)) return NextResponse.json({ error: `Invalid transition: "${order.status}" → "${newStatus}". Allowed: ${allowed.join(', ') || 'none'}` }, { status: 400 });

    const customerPhone = order.customerPhone;
    let finalTrackingNumber = trackingNumber;

    if (newStatus === 'shipped') {
      if (!trackingNumber) return NextResponse.json({ error: 'trackingNumber is required when shipping' }, { status: 400 });
      try {
        const iOrder: IOrder = {
          _id: order.id, orderNumber: order.orderNumber,
          customer: { fullName: order.customerName, phone: order.customerPhone, email: order.customerEmail ?? undefined, governorate: order.customerGov, city: order.customerCity, address: order.customerAddress, userId: order.userId ?? undefined },
          items: order.items.map((i) => ({ productId: i.productId, productName: i.productName, productNameAr: i.productNameAr, image: i.image, price: i.price, quantity: i.quantity })),
          subtotal: order.subtotal, shippingFee: order.shippingFee, discount: order.discount, total: order.total,
          status: 'shipped', statusHistory: [], paymentMethod: order.paymentMethod as 'cod', trackingNumber,
          otpVerified: order.otpVerified, createdAt: order.createdAt.toISOString(), updatedAt: order.updatedAt.toISOString(),
        };
        const result = await createBostaShipment(iOrder);
        finalTrackingNumber = result.trackingNumber;
      } catch (err) {
        console.warn('[PATCH /api/orders] Bosta failed:', err);
      }
    }

    if (newStatus === 'cancelled') {
      if (!cancelReason) return NextResponse.json({ error: 'cancelReason is required when cancelling' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = { status: newStatus };
    if (newStatus === 'shipped') { updateData.trackingNumber = finalTrackingNumber; }
    if (newStatus === 'cancelled') { updateData.cancelReason = cancelReason; }

    await db.$transaction(async (tx) => {
      await tx.order.update({ where: { id }, data: updateData });
      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          status: newStatus,
          note: note ?? (newStatus === 'cancelled' ? `Cancelled: ${cancelReason}` : `Order ${newStatus}`),
          updatedBy: 'admin',
        },
      });

      // Restore stock on cancel
      if (newStatus === 'cancelled') {
        for (const item of order.items) {
          await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity }, sold: { decrement: item.quantity } } });
        }
      }
    });

    sendOrderStatusUpdate(customerPhone, order.orderNumber, newStatus as 'confirmed', finalTrackingNumber).catch(console.error);

    const updatedOrder = await db.order.findUnique({ where: { id }, include: { items: true, statusHistory: { orderBy: { timestamp: 'asc' } } } });
    if (!updatedOrder) return NextResponse.json({ error: 'Order not found after update' }, { status: 404 });
    const updatedItems = updatedOrder.items.map((i) => ({ ...i, _id: i.id, selectedVariants: JSON.parse(i.selectedVariants) }));
    return NextResponse.json({ success: true, data: shapeOrder(updatedOrder as unknown as Record<string, unknown>, updatedItems, updatedOrder.statusHistory) });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error('[PATCH /api/orders/[id]]', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
