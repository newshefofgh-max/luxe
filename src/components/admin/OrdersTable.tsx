'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronUp, ChevronDown, Eye, RefreshCw } from 'lucide-react';
import type { IOrder, OrderStatus } from '@/types';
import axios from 'axios';
import toast from 'react-hot-toast';

const STATUS_BADGE: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: 'قيد الانتظار', className: 'bg-yellow-500/20 text-yellow-400' },
  confirmed: { label: 'مؤكد', className: 'bg-blue-500/20 text-blue-400' },
  shipped: { label: 'تم الشحن', className: 'bg-purple-500/20 text-purple-400' },
  delivered: { label: 'تم التسليم', className: 'bg-green-500/20 text-green-400' },
  cancelled: { label: 'ملغي', className: 'bg-red-500/20 text-red-400' },
};

const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

interface OrdersTableProps {
  orders: IOrder[];
  onRefresh: () => void;
}

type SortKey = 'createdAt' | 'total' | 'status';

export default function OrdersTable({ orders, onRefresh }: OrdersTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const sorted = [...orders].sort((a, b) => {
    let av: unknown = a[sortKey];
    let bv: unknown = b[sortKey];
    if (sortKey === 'createdAt') {
      av = new Date(a.createdAt).getTime();
      bv = new Date(b.createdAt).getTime();
    }
    const dir = sortDir === 'asc' ? 1 : -1;
    return (av as number) < (bv as number) ? -dir : dir;
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  };

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    const token = localStorage.getItem('admin_token');
    setUpdatingId(orderId);
    try {
      await axios.patch(
        `/api/orders/${orderId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`تم تحديث الحالة إلى ${STATUS_BADGE[status].label}`);
      onRefresh();
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error : 'فشل التحديث';
      toast.error(msg ?? 'فشل التحديث');
    } finally {
      setUpdatingId(null);
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col ? (
      sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
    ) : (
      <ChevronDown size={14} className="opacity-30" />
    );

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>لا توجد طلبات تطابق الفلتر المحدد</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-right">
        <thead>
          <tr className="border-b border-gray-700 text-gray-400">
            <th className="pb-3 pr-4 font-medium">
              <button onClick={() => handleSort('createdAt')} className="flex items-center gap-1">
                رقم الطلب <SortIcon col="createdAt" />
              </button>
            </th>
            <th className="pb-3 pr-4 font-medium">العميل</th>
            <th className="pb-3 pr-4 font-medium">المحافظة</th>
            <th className="pb-3 pr-4 font-medium">
              <button onClick={() => handleSort('total')} className="flex items-center gap-1">
                الإجمالي <SortIcon col="total" />
              </button>
            </th>
            <th className="pb-3 pr-4 font-medium">
              <button onClick={() => handleSort('status')} className="flex items-center gap-1">
                الحالة <SortIcon col="status" />
              </button>
            </th>
            <th className="pb-3 pr-4 font-medium">التاريخ</th>
            <th className="pb-3 pr-4 font-medium">إجراءات</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {sorted.map((order) => {
            const badge = STATUS_BADGE[order.status];
            const transitions = STATUS_TRANSITIONS[order.status];

            return (
              <tr key={order._id} className="hover:bg-gray-800/50 transition-colors">
                <td className="py-3 pr-4">
                  <span className="text-[#C9A84C] font-mono font-medium">
                    {order.orderNumber}
                  </span>
                  <p className="text-gray-500 text-xs">{order.items.length} منتج</p>
                </td>
                <td className="py-3 pr-4">
                  <p className="text-white">{order.customer.fullName}</p>
                  <p className="text-gray-400 text-xs" dir="ltr">{order.customer.phone}</p>
                </td>
                <td className="py-3 pr-4 text-gray-300">{order.customer.governorate}</td>
                <td className="py-3 pr-4">
                  <span className="text-white font-medium">{order.total}</span>
                  <span className="text-gray-400 text-xs"> جنيه</span>
                </td>
                <td className="py-3 pr-4">
                  <span className={`px-2 py-1 text-xs rounded-sm ${badge.className}`}>
                    {badge.label}
                  </span>
                </td>
                <td className="py-3 pr-4 text-gray-400 text-xs whitespace-nowrap">
                  {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                  <br />
                  {new Date(order.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/orders/${order._id}`}
                      className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                      title="عرض التفاصيل"
                    >
                      <Eye size={15} />
                    </Link>
                    {transitions.length > 0 && (
                      <select
                        onChange={(e) => updateStatus(order._id, e.target.value as OrderStatus)}
                        value=""
                        disabled={updatingId === order._id}
                        className="text-xs bg-gray-700 text-gray-300 border border-gray-600 rounded px-2 py-1 cursor-pointer hover:border-[#C9A84C] disabled:opacity-50"
                      >
                        <option value="" disabled>تحديث</option>
                        {transitions.map((s) => (
                          <option key={s} value={s}>{STATUS_BADGE[s].label}</option>
                        ))}
                      </select>
                    )}
                    {updatingId === order._id && (
                      <RefreshCw size={14} className="text-[#C9A84C] animate-spin" />
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
