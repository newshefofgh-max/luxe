'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingBag, TrendingUp, Package, XCircle, DollarSign, BarChart2
} from 'lucide-react';
import axios from 'axios';

interface AnalyticsSummary {
  totalOrders: number;
  pending: number;
  confirmed: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  totalRevenue: number;
  collectedRevenue: number;
  avgOrderValue: number;
  fakeOrders: number;
  fakeOrderRate: number;
}

interface RevenueDay {
  _id: string;
  revenue: number;
  orders: number;
}

interface TopProduct {
  _id: string;
  name: string;
  nameAr: string;
  image: string;
  totalSold: number;
  revenue: number;
}

interface TopGov {
  _id: string;
  count: number;
  revenue: number;
}

interface AnalyticsData {
  summary: AnalyticsSummary;
  revenueByDay: RevenueDay[];
  topProducts: TopProduct[];
  topGovernorates: TopGov[];
}

const STAT_CARDS = [
  { key: 'totalOrders', label: 'إجمالي الطلبات', icon: ShoppingBag, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { key: 'collectedRevenue', label: 'الإيراد المحصل', icon: DollarSign, color: 'text-green-400', bg: 'bg-green-500/10', suffix: ' جنيه' },
  { key: 'delivered', label: 'تم التسليم', icon: Package, color: 'text-[#C9A84C]', bg: 'bg-[#C9A84C]/10' },
  { key: 'cancelled', label: 'ملغي', icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
  { key: 'avgOrderValue', label: 'متوسط قيمة الطلب', icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/10', suffix: ' جنيه' },
  { key: 'fakeOrderRate', label: 'معدل الطلبات الوهمية', icon: BarChart2, color: 'text-orange-400', bg: 'bg-orange-500/10', suffix: '%' },
];

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-400',
  confirmed: 'bg-blue-400',
  shipped: 'bg-purple-400',
  delivered: 'bg-green-400',
  cancelled: 'bg-red-400',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'قيد الانتظار',
  confirmed: 'مؤكد',
  shipped: 'تم الشحن',
  delivered: 'تم التسليم',
  cancelled: 'ملغي',
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('admin_token');
        const { data: res } = await axios.get(`/api/analytics?days=${days}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch {
        // Silent
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [days]);

  const maxRevenue = data?.revenueByDay.length
    ? Math.max(...data.revenueByDay.map((d) => d.revenue))
    : 1;

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-[#C9A84C] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!data) return null;

  const { summary, revenueByDay, topProducts, topGovernorates } = data;

  // Status breakdown for bar chart
  const statusItems = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((s) => ({
    key: s,
    count: summary[s as keyof AnalyticsSummary] as number,
    pct: summary.totalOrders > 0
      ? Math.round(((summary[s as keyof AnalyticsSummary] as number) / summary.totalOrders) * 100)
      : 0,
  }));

  return (
    <div className="p-6" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">الإحصائيات والتحليلات</h1>
        <select
          value={days}
          onChange={(e) => setDays(parseInt(e.target.value))}
          className="bg-gray-800 border border-gray-700 text-white text-sm rounded px-3 py-1.5"
        >
          <option value={7}>آخر 7 أيام</option>
          <option value={30}>آخر 30 يوم</option>
          <option value={90}>آخر 3 أشهر</option>
          <option value={365}>آخر سنة</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {STAT_CARDS.map((card, i) => {
          const val = summary[card.key as keyof AnalyticsSummary];
          return (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-gray-800 border border-gray-700 rounded-sm p-5"
            >
              <div className={`w-10 h-10 rounded-sm ${card.bg} flex items-center justify-center mb-3`}>
                <card.icon className={card.color} size={20} />
              </div>
              <p className="text-2xl font-bold text-white">
                {val?.toLocaleString('ar-EG')}{card.suffix ?? ''}
              </p>
              <p className="text-gray-400 text-sm mt-1">{card.label}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-gray-800 border border-gray-700 rounded-sm p-6">
          <h2 className="text-white font-semibold mb-4">الإيراد اليومي</h2>
          {revenueByDay.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">لا توجد بيانات</p>
          ) : (
            <div className="flex items-end gap-1 h-40 overflow-x-auto pb-2">
              {revenueByDay.map((day) => {
                const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
                return (
                  <div key={day._id} className="flex flex-col items-center gap-1 min-w-[30px] group">
                    <div
                      className="relative w-full bg-[#C9A84C] rounded-t-sm transition-all hover:bg-[#e8c85a]"
                      style={{ height: `${Math.max(height, 2)}%` }}
                    >
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                        {day.revenue} جنيه
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 rotate-45 origin-left whitespace-nowrap">
                      {day._id.slice(5)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Status breakdown */}
        <div className="bg-gray-800 border border-gray-700 rounded-sm p-6">
          <h2 className="text-white font-semibold mb-4">توزيع حالات الطلبات</h2>
          <div className="space-y-3">
            {statusItems.map((item) => (
              <div key={item.key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">{STATUS_LABELS[item.key]}</span>
                  <span className="text-white font-medium">{item.count} ({item.pct}%)</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${STATUS_COLORS[item.key]} transition-all`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top products */}
        <div className="bg-gray-800 border border-gray-700 rounded-sm p-6">
          <h2 className="text-white font-semibold mb-4">أفضل 5 منتجات</h2>
          <div className="space-y-4">
            {topProducts.map((p, i) => (
              <div key={p._id} className="flex items-center gap-3">
                <span className="text-[#C9A84C] font-bold w-5 text-sm">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm truncate">{p.nameAr || p.name}</p>
                  <p className="text-gray-400 text-xs">{p.totalSold} قطعة مباعة</p>
                </div>
                <span className="text-green-400 text-sm font-medium">{p.revenue} جنيه</span>
              </div>
            ))}
            {topProducts.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">لا توجد بيانات</p>
            )}
          </div>
        </div>

        {/* Top governorates */}
        <div className="bg-gray-800 border border-gray-700 rounded-sm p-6">
          <h2 className="text-white font-semibold mb-4">أعلى المحافظات طلباً</h2>
          <div className="space-y-3">
            {topGovernorates.map((gov, i) => (
              <div key={gov._id} className="flex items-center gap-3">
                <span className="text-[#C9A84C] font-bold w-5 text-sm">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">{gov._id}</span>
                    <span className="text-white">{gov.count} طلب</span>
                  </div>
                  <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#C9A84C] rounded-full"
                      style={{
                        width: `${topGovernorates[0]?.count
                          ? (gov.count / topGovernorates[0].count) * 100
                          : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {topGovernorates.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">لا توجد بيانات</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
