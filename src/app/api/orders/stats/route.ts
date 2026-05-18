export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, AuthError } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    requireAdmin(req);

    const counts = await db.order.groupBy({ by: ['status'], _count: { _all: true } });
    const stats: Record<string, number> = { total: 0, pending: 0, confirmed: 0, shipped: 0, delivered: 0, cancelled: 0 };
    for (const row of counts) {
      stats[row.status] = row._count._all;
      stats.total += row._count._all;
    }

    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error('[GET /api/orders/stats]', error);
    return NextResponse.json({ error: 'Failed to fetch order stats' }, { status: 500 });
  }
}
