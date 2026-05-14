export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getBostaShipmentStatus } from '@/lib/shipping';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const trackingNumber = searchParams.get('trackingNumber');
  const orderNumber = searchParams.get('orderNumber');

  if (!trackingNumber && !orderNumber) {
    return NextResponse.json(
      { error: 'trackingNumber or orderNumber is required' },
      { status: 400 }
    );
  }

  try {
    const where = trackingNumber
      ? { trackingNumber }
      : { orderNumber: orderNumber! };

    const order = await db.order.findFirst({
      where,
      select: {
        orderNumber: true,
        status: true,
        trackingNumber: true,
        customerGov: true,
        createdAt: true,
        statusHistory: { orderBy: { timestamp: 'asc' } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    let liveStatus: string | null = null;
    if (order.trackingNumber) {
      try {
        liveStatus = await getBostaShipmentStatus(order.trackingNumber);
      } catch {
        // Silently fail — return stored status
      }
    }

    return NextResponse.json({
      data: {
        orderNumber: order.orderNumber,
        status: liveStatus ?? order.status,
        trackingNumber: order.trackingNumber ?? null,
        timeline: order.statusHistory ?? [],
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    console.error('[GET /api/shipping/track]', error);
    return NextResponse.json({ error: 'Failed to fetch tracking info' }, { status: 500 });
  }
}
