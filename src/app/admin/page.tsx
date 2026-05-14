'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  DollarSign,
  Clock,
  XCircle,
  TrendingUp,
  Package,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { IAnalyticsSummary, IOrder } from '@/types';

// Minimal date formatter
function fmt(date: Date | string, pattern: string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const pad = (n: number) => String(n).padStart(2, '0');
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return pattern
    .replace('yyyy', String(d.getFullYear()))
    .replace('MMMM', d.toLocaleString('en', { month: 'long' }))
    .replace('MMM', MONTHS[d.getMonth()] ?? '')
    .replace('MM', pad(d.getMonth() + 1))
    .replace('dd', pad(d.getDate()))
    .replace('d', String(d.getDate()))
    .replace('HH', pad(d.getHours()))
    .replace('mm', pad(d.getMinutes()))
    .replace('ss', pad(d.getSeconds()));
}


const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  confirmed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  shipped: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  delivered: 'bg-green-500/20 text-green-400 border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
};

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  delay = 0,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="bg-[#1f2937] rounded-xl border border-gray-700 p-5 hover:border-gray-600 transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-lg ${color}`}>
          <Icon size={18} />
        </div>
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm font-medium text-gray-300">{title}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </motion.div>
  );
}

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<IAnalyticsSummary | null>(null);
  const [recentOrders, setRecentOrders] = useState<IOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const headers = { Authorization: `Bearer ${token}` };

      const [analyticsRes, ordersRes] = await Promise.all([
        fetch('/api/admin/analytics?days=30', { headers }),
        fetch('/api/admin/orders?limit=10&sortBy=createdAt&sortOrder=desc', { headers }),
      ]);

      if (analyticsRes.ok) {
        const a = await analyticsRes.json();
        if (a.success) setAnalytics(a.data);
      }

      if (ordersRes.ok) {
        const o = await ordersRes.json();
        if (o.success) setRecentOrders(o.data);
      }

      setLastRefresh(new Date());
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const maxRevenue = analytics?.revenueByDay?.reduce((m, d) => Math.max(m, d.revenue), 0) || 1;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Last updated: {fmt(lastRefresh, 'HH:mm:ss')}
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-[#1f2937] border border-gray-700 text-gray-300 hover:text-white hover:border-gray-600 rounded-lg text-sm transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Orders"
          value={analytics?.totalOrders ?? '—'}
          subtitle={`${analytics?.pendingOrders ?? 0} pending`}
          icon={ShoppingBag}
          color="bg-[#C9A84C]/10 text-[#C9A84C]"
          delay={0}
        />
        <StatCard
          title="Revenue Collected"
          value={analytics ? `EGP ${analytics.collectedRevenue.toLocaleString()}` : '—'}
          subtitle="Delivered orders only"
          icon={DollarSign}
          color="bg-green-500/10 text-green-400"
          delay={0.05}
        />
        <StatCard
          title="Pending Confirmation"
          value={analytics?.pendingOrders ?? '—'}
          subtitle="Needs action"
          icon={Clock}
          color="bg-orange-500/10 text-orange-400"
          delay={0.1}
        />
        <StatCard
          title="Cancelled Orders"
          value={analytics?.cancelledOrders ?? '—'}
          subtitle={`${analytics ? Math.round(analytics.fakeOrderRate) : 0}% fake rate`}
          icon={XCircle}
          color="bg-red-500/10 text-red-400"
          delay={0.15}
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="xl:col-span-2 bg-[#1f2937] rounded-xl border border-gray-700 p-5"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-white font-semibold">Revenue Trend</h3>
              <p className="text-gray-500 text-xs mt-0.5">Last 30 days</p>
            </div>
            <TrendingUp size={18} className="text-[#C9A84C]" />
          </div>

          {analytics?.revenueByDay && analytics.revenueByDay.length > 0 ? (
            <div className="flex items-end gap-1 h-40">
              {analytics.revenueByDay.slice(-30).map((day, i) => (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-1 group"
                >
                  <div className="relative w-full">
                    <div
                      className="w-full bg-[#C9A84C]/70 hover:bg-[#C9A84C] rounded-t transition-colors"
                      style={{
                        height: `${Math.max(4, (day.revenue / maxRevenue) * 144)}px`,
                      }}
                    />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      {fmt(new Date(day.date), 'MMM d')}: EGP {day.revenue.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-gray-600">
              {isLoading ? 'Loading...' : 'No revenue data available'}
            </div>
          )}
        </motion.div>

        {/* Status breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-[#1f2937] rounded-xl border border-gray-700 p-5"
        >
          <h3 className="text-white font-semibold mb-5">Orders by Status</h3>
          {analytics ? (
            <div className="space-y-3">
              {[
                { label: 'Pending', count: analytics.pendingOrders, color: 'bg-yellow-500' },
                { label: 'Confirmed', count: analytics.confirmedOrders, color: 'bg-blue-500' },
                { label: 'Shipped', count: analytics.shippedOrders, color: 'bg-purple-500' },
                { label: 'Delivered', count: analytics.deliveredOrders, color: 'bg-green-500' },
                { label: 'Cancelled', count: analytics.cancelledOrders, color: 'bg-red-500' },
              ].map(({ label, count, color }) => {
                const pct = analytics.totalOrders > 0 ? (count / analytics.totalOrders) * 100 : 0;
                return (
                  <div key={label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">{label}</span>
                      <span className="text-white font-medium">{count}</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${color} rounded-full transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-8 bg-gray-700/50 rounded animate-pulse" />
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent orders */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="xl:col-span-2 bg-[#1f2937] rounded-xl border border-gray-700 p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Recent Orders</h3>
            <Link
              href="/admin/orders"
              className="text-[#C9A84C] text-sm hover:text-[#b8963e] flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-gray-700/50 rounded animate-pulse" />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">No orders yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 text-xs border-b border-gray-700">
                    <th className="text-left pb-2 font-medium">Order</th>
                    <th className="text-left pb-2 font-medium">Customer</th>
                    <th className="text-left pb-2 font-medium hidden sm:table-cell">Total</th>
                    <th className="text-left pb-2 font-medium">Status</th>
                    <th className="text-left pb-2 font-medium hidden md:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-700/30 transition-colors">
                      <td className="py-3 pr-3">
                        <Link
                          href={`/admin/orders/${order._id}`}
                          className="text-[#C9A84C] hover:underline font-mono text-xs"
                        >
                          #{order.orderNumber}
                        </Link>
                      </td>
                      <td className="py-3 pr-3 text-gray-300">
                        <div>{order.customer.fullName}</div>
                        <div className="text-gray-500 text-xs">{order.customer.phone}</div>
                      </td>
                      <td className="py-3 pr-3 text-gray-300 hidden sm:table-cell">
                        EGP {order.total.toLocaleString()}
                      </td>
                      <td className="py-3 pr-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[order.status]}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 text-gray-500 text-xs hidden md:table-cell">
                        {fmt(new Date(order.createdAt), 'MMM d, HH:mm')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Top products */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-[#1f2937] rounded-xl border border-gray-700 p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Top Products</h3>
            <Package size={18} className="text-gray-500" />
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-14 bg-gray-700/50 rounded animate-pulse" />
              ))}
            </div>
          ) : analytics?.topProducts && analytics.topProducts.length > 0 ? (
            <div className="space-y-3">
              {analytics.topProducts.slice(0, 5).map((tp, i) => (
                <div key={tp.product._id} className="flex items-center gap-3">
                  <span className="text-gray-600 text-xs font-bold w-4">{i + 1}</span>
                  <div className="w-10 h-10 rounded-lg bg-gray-700 overflow-hidden flex-shrink-0">
                    {tp.product.images[0] && (
                      <img
                        src={tp.product.images[0]}
                        alt={tp.product.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{tp.product.name}</p>
                    <p className="text-gray-500 text-xs">EGP {tp.product.price.toLocaleString()}</p>
                  </div>
                  <span className="text-[#C9A84C] text-sm font-bold">{tp.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-8">No data yet</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
