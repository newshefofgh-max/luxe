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

    // Top products — aggregate by productId then join full product data
    const nonCancelledItems = await db.orderItem.findMany({ where: { order: { status: { not: 'cancelled' } } } });
    const productSoldMap: Record<string, number> = {};
    for (const item of nonCancelledItems) {
      productSoldMap[item.productId] = (productSoldMap[item.productId] ?? 0) + item.quantity;
    }
    const topProductIds = Object.entries(productSoldMap).sort(([, a], [, b]) => b - a).slice(0, 5).map(([id]) => id);
    const topProductDocs = await db.product.findMany({ where: { id: { in: topProductIds } }, select: { id: true, name: true, nameAr: true, images: true, price: true, comparePrice: true, category: true, stock: true, sold: true, isActive: true, isFeatured: true, slug: true } });
    const topProducts = topProductIds
      .map((pid) => {
        const p = topProductDocs.find((d) => d.id === pid);
        if (!p) return null;
        return { product: { _id: p.id, name: p.name, nameAr: p.nameAr, images: p.images ? JSON.parse(p.images as string) : [], price: p.price, comparePrice: p.comparePrice, category: p.category, stock: p.stock, sold: p.sold, isActive: p.isActive, isFeatured: p.isFeatured, slug: p.slug }, count: productSoldMap[pid] ?? 0 };
      })
      .filter(Boolean);

    // Revenue by day — return { date, revenue } shape
    const revenueByDayFormatted = Object.entries(revenueByDayMap).sort(([a], [b]) => a.localeCompare(b)).map(([date, v]) => ({ date, revenue: v.revenue }));

    // Top governorates
    const govMap: Record<string, { count: number; revenue: number }> = {};
    for (const o of allOrders.filter((o) => o.status !== 'cancelled')) {
      const gov = o.customerGov || 'Unknown';
      if (!govMap[gov]) govMap[gov] = { count: 0, revenue: 0 };
      govMap[gov].count++;
      govMap[gov].revenue += o.total;
    }
    const topGovernorates = Object.entries(govMap).map(([_id, v]) => ({ _id, ...v })).sort((a, b) => b.count - a.count).slice(0, 10);

    const cancelledCount = statusMap['cancelled']?.count ?? 0;
    const fakeOrderRate = totalOrders > 0 ? Math.round((cancelledCount / totalOrders) * 100) : 0;
    const conversionRate = totalOrders > 0 ? Math.round(((statusMap['delivered']?.count ?? 0) / totalOrders) * 100) : 0;

    return NextResponse.json({
      success: true,
      data: {
        totalOrders,
        pendingOrders: statusMap['pending']?.count ?? 0,
        confirmedOrders: statusMap['confirmed']?.count ?? 0,
        shippedOrders: statusMap['shipped']?.count ?? 0,
        deliveredOrders: statusMap['delivered']?.count ?? 0,
        cancelledOrders: cancelledCount,
        totalRevenue: Object.values(statusMap).reduce((s, v) => s + v.revenue, 0),
        collectedRevenue: deliveredRevenue,
        conversionRate,
        fakeOrderRate,
        topProducts,
        revenueByDay: revenueByDayFormatted,
        topGovernorates,
        avgOrderValue,
      },
    });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error('[GET /api/analytics]', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
