export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, AuthError } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authUser = requireAuth(req);
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)));
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where: { userId: authUser.userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { items: true, statusHistory: true },
      }),
      db.order.count({ where: { userId: authUser.userId } }),
    ]);

    const shaped = orders.map((o) => ({
      ...o,
      _id: o.id,
      customer: {
        fullName: o.customerName,
        phone: o.customerPhone,
        email: o.customerEmail,
        governorate: o.customerGov,
        city: o.customerCity,
        address: o.customerAddress,
      },
      items: o.items.map((i) => ({
        ...i,
        _id: i.id,
        selectedVariants: JSON.parse(i.selectedVariants),
      })),
      statusHistory: o.statusHistory,
    }));

    return NextResponse.json({
      data: { orders: shaped, total, page, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error('[GET /api/orders/mine]', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
