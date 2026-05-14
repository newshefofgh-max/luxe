export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, AuthError } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    requireAdmin(req);
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') ?? '30', 10);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // All orders grouped by status
    const allOrders = await db.order.findMany({ select: { status: true, total: true, createdAt: true, customerGov: true } });

    const statusMap: Record<string, { count: number; revenue: number }> = {};
    for (const o of allOrders) {
      if (!statusMap[o.status]) statusMap[o.status] = { count: 0, revenue: 0 };
      statusMap[o.status].count++;
      statusMap[o.status].revenue += o.total;
    }

    const totalOrders = allOrders.length;
    const deliveredRevenue = statusMap['delivered']?.revenue ?? 0;
    const nonCancelledOrders = allOrders.filter((o) => o.status !== 'cancelled');
    const avgOrderValue = nonCancelledOrders.length > 0
      ? Math.round(nonCancelledOrders.reduce((s, o) => s + o.total, 0) / nonCancelledOrders.length)
      : 0;

    // Revenue by day
    const recentOrders = allOrders.filter((o) => o.createdAt >= startDate && o.status !== 'cancelled');
    const revenueByDayMap: Record<string, { revenue: number; orders: number }> = {};
    for (const o of recentOrders) {
      const day = o.createdAt.toISOString().slice(0, 10);
      if (!revenueByDayMap[day]) revenueByDayMap[day] = { revenue: 0, orders: 0 };
      revenueByDayMap[day].revenue += o.total;
      revenueByDayMap[day].orders++;
    }
    const revenueByDay = Object.entries(revenueByDayMap).sort(([a], [b]) => a.localeCompare(b)).map(([_id, v]) => ({ _id, ...v }));

    // Top products
    const nonCancelledItems = await db.orderItem.findMany({ where: { order: { status: { not: 'cancelled' } } }, include: { product: { select: { name: true, nameAr: true } } } });
    const productStats: Record<string, { name: string; nameAr: string; totalSold: number; revenue: number }> = {};
    for (const item of nonCancelledItems) {
      if (!productStats[item.productId]) productStats[item.productId] = { name: item.product.name, nameAr: item.product.nameAr, totalSold: 0, revenue: 0 };
      productStats[item.productId].totalSold += item.quantity;
      productStats[item.productId].revenue += item.price * item.quantity;
    }
    const topProducts = Object.entries(productStats).map(([_id, v]) => ({ _id, ...v })).sort((a, b) => b.totalSold - a.totalSold).slice(0, 5);

    // Top governorates
    const govMap: Record<string, { count: number; revenue: number }> = {};
    for (const o of allOrders.filter((o) => o.status !== 'cancelled')) {
      const gov = o.customerGov || 'Unknown';
      if (!govMap[gov]) govMap[gov] = { count: 0, revenue: 0 };
      govMap[gov].count++;
      govMap[gov].revenue += o.total;
    }
    const topGovernorates = Object.entries(govMap).map(([_id, v]) => ({ _id, ...v })).sort((a, b) => b.count - a.count).slice(0, 10);

    const fakeOrders = allOrders.filter((o) => o.status === 'cancelled').length;
    const fakeOrderRate = totalOrders > 0 ? Math.round((fakeOrders / totalOrders) * 100) : 0;

    return NextResponse.json({ data: { summary: { totalOrders, pending: statusMap['pending']?.count ?? 0, confirmed: statusMap['confirmed']?.count ?? 0, shipped: statusMap['shipped']?.count ?? 0, delivered: statusMap['delivered']?.count ?? 0, cancelled: statusMap['cancelled']?.count ?? 0, totalRevenue: Object.values(statusMap).reduce((s, v) => s + v.revenue, 0), collectedRevenue: deliveredRevenue, avgOrderValue, fakeOrders, fakeOrderRate }, revenueByDay, topProducts, topGovernorates } });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error('[GET /api/analytics]', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
