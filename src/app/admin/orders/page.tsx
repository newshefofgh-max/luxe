'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Download,
  Eye,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  X,
} from 'lucide-react';
import { IOrder, OrderStatus } from '@/types';

// Minimal date formatter replacing date-fns
function fmt(date: Date | string, pattern: string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const pad = (n: number) => String(n).padStart(2, '0');
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return pattern
    .replace('yyyy', String(d.getFullYear()))
    .replace('MM', pad(d.getMonth() + 1))
    .replace('MMM', MONTHS[d.getMonth()] ?? '')
    .replace('dd', pad(d.getDate()))
    .replace('d', String(d.getDate()))
    .replace('HH', pad(d.getHours()))
    .replace('mm', pad(d.getMinutes()))
    .replace('ss', pad(d.getSeconds()));
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  confirmed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  shipped: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  delivered: 'bg-green-500/20 text-green-400 border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const ALL_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

type SortField = 'orderNumber' | 'customer' | 'total' | 'createdAt' | 'status';
type SortDir = 'asc' | 'desc';

interface OrderStats {
  total: number;
  pending: number;
  confirmed: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [stats, setStats] = useState<OrderStats>({ total: 0, pending: 0, confirmed: 0, shipped: 0, delivered: 0, cancelled: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const LIMIT = 25;

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const params = new URLSearchParams({
        page: String(page),
        limit: String(LIMIT),
        sortBy: sortField,
        sortOrder: sortDir,
      });
      if (statusFilter) params.set('status', statusFilter);
      if (search) params.set('search', search);
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);

      const res = await fetch(`/api/orders?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.total);
      }
    } catch (err) {
      console.error('Fetch orders error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, sortField, sortDir, statusFilter, search, dateFrom, dateTo]);

  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/orders/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch {}
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
    setPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingStatus(orderId);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
        );
        fetchStats();
      }
    } catch {}
    setUpdatingStatus(null);
  };

  const toggleSelect = (id: string) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map((o) => o._id));
    }
  };

  const exportCSV = () => {
    const toExport = selectedOrders.length > 0
      ? orders.filter((o) => selectedOrders.includes(o._id))
      : orders;

    const headers = ['Order #', 'Customer', 'Phone', 'Governorate', 'Total', 'Items', 'Status', 'Payment', 'Date'];
    const rows = toExport.map((o) => [
      o.orderNumber,
      o.customer.fullName,
      o.customer.phone,
      o.customer.governorate,
      o.total,
      o.items.reduce((s, i) => s + i.quantity, 0),
      o.status,
      o.paymentMethod,
      fmt(new Date(o.createdAt), 'yyyy-MM-dd HH:mm'),
    ]);

    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${fmt(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronsUpDown size={12} className="text-gray-600" />;
    return sortDir === 'asc' ? (
      <ChevronUp size={12} className="text-[#C9A84C]" />
    ) : (
      <ChevronDown size={12} className="text-[#C9A84C]" />
    );
  };

  const clearFilters = () => {
    setStatusFilter('');
    setDateFrom('');
    setDateTo('');
    setSearch('');
    setPage(1);
  };

  const hasFilters = statusFilter || dateFrom || dateTo || search;

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Orders</h1>
          <p className="text-gray-500 text-sm mt-1">{totalCount} total orders</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { fetchOrders(); fetchStats(); }}
            className="p-2 bg-[#1f2937] border border-gray-700 rounded-lg text-gray-400 hover:text-white hover:border-gray-600 transition-colors"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-[#C9A84C] hover:bg-[#b8963e] text-[#111827] font-medium rounded-lg text-sm transition-colors"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {[
          { label: 'Total', count: stats.total, color: 'text-white', active: !statusFilter },
          { label: 'Pending', count: stats.pending, color: 'text-yellow-400', active: statusFilter === 'pending' },
          { label: 'Confirmed', count: stats.confirmed, color: 'text-blue-400', active: statusFilter === 'confirmed' },
          { label: 'Shipped', count: stats.shipped, color: 'text-purple-400', active: statusFilter === 'shipped' },
          { label: 'Delivered', count: stats.delivered, color: 'text-green-400', active: statusFilter === 'delivered' },
          { label: 'Cancelled', count: stats.cancelled, color: 'text-red-400', active: statusFilter === 'cancelled' },
        ].map(({ label, count, color, active }) => (
          <button
            key={label}
            onClick={() => {
              setStatusFilter(label === 'Total' ? '' : label.toLowerCase() as OrderStatus);
              setPage(1);
            }}
            className={`bg-[#1f2937] border rounded-lg p-3 text-center transition-all ${
              active ? 'border-[#C9A84C] bg-[#C9A84C]/5' : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            <p className={`text-xl font-bold ${color}`}>{count}</p>
            <p className="text-gray-500 text-xs">{label}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-[#1f2937] border border-gray-700 rounded-xl p-4">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-48">
            <label className="block text-xs text-gray-500 mb-1.5">Search</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Order #, phone, name..."
                className="w-full bg-[#111827] border border-gray-600 rounded-lg pl-9 pr-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#C9A84C] transition-colors"
              />
            </div>
          </div>

          <div className="w-40">
            <label className="block text-xs text-gray-500 mb-1.5">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as OrderStatus | ''); setPage(1); }}
              className="w-full bg-[#111827] border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#C9A84C] transition-colors"
            >
              <option value="">All Statuses</option>
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>

          <div className="w-36">
            <label className="block text-xs text-gray-500 mb-1.5">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              className="w-full bg-[#111827] border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#C9A84C] transition-colors"
            />
          </div>

          <div className="w-36">
            <label className="block text-xs text-gray-500 mb-1.5">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              className="w-full bg-[#111827] border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#C9A84C] transition-colors"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-[#C9A84C] hover:bg-[#b8963e] text-[#111827] font-medium rounded-lg text-sm transition-colors flex items-center gap-2"
          >
            <Filter size={14} />
            Filter
          </button>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="px-3 py-2 text-gray-400 hover:text-white text-sm flex items-center gap-1 transition-colors"
            >
              <X size={14} />
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Bulk actions */}
      {selectedOrders.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#C9A84C]/10 border border-[#C9A84C]/30 rounded-xl px-4 py-3 flex items-center justify-between"
        >
          <span className="text-[#C9A84C] text-sm font-medium">
            {selectedOrders.length} order{selectedOrders.length > 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={exportCSV}
              className="text-sm text-[#C9A84C] hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <Download size={14} /> Export Selected
            </button>
            <button
              onClick={() => setSelectedOrders([])}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Deselect
            </button>
          </div>
        </motion.div>
      )}

      {/* Table */}
      <div className="bg-[#1f2937] border border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 bg-[#111827]/50">
                <th className="p-4 w-8">
                  <input
                    type="checkbox"
                    checked={selectedOrders.length === orders.length && orders.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-600 bg-gray-700 text-[#C9A84C] focus:ring-[#C9A84C]"
                  />
                </th>
                {[
                  { label: 'Order #', field: 'orderNumber' as SortField },
                  { label: 'Customer', field: 'customer' as SortField },
                  { label: 'Phone', field: null },
                  { label: 'Governorate', field: null },
                  { label: 'Total', field: 'total' as SortField },
                  { label: 'Items', field: null },
                  { label: 'Status', field: 'status' as SortField },
                  { label: 'Date', field: 'createdAt' as SortField },
                  { label: 'Actions', field: null },
                ].map(({ label, field }) => (
                  <th
                    key={label}
                    className={`p-4 text-left text-xs font-medium text-gray-400 whitespace-nowrap ${field ? 'cursor-pointer hover:text-white select-none' : ''}`}
                    onClick={() => field && handleSort(field)}
                  >
                    <div className="flex items-center gap-1.5">
                      {label}
                      {field && <SortIcon field={field} />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 10 }).map((_, j) => (
                      <td key={j} className="p-4">
                        <div className="h-4 bg-gray-700/50 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center text-gray-500 py-12">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order._id}
                    className={`hover:bg-gray-700/20 transition-colors ${
                      selectedOrders.includes(order._id) ? 'bg-[#C9A84C]/5' : ''
                    }`}
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order._id)}
                        onChange={() => toggleSelect(order._id)}
                        className="rounded border-gray-600 bg-gray-700 text-[#C9A84C] focus:ring-[#C9A84C]"
                      />
                    </td>
                    <td className="p-4">
                      <Link
                        href={`/admin/orders/${order._id}`}
                        className="text-[#C9A84C] hover:text-[#b8963e] font-mono text-xs font-medium hover:underline"
                      >
                        #{order.orderNumber}
                      </Link>
                    </td>
                    <td className="p-4 text-gray-200 whitespace-nowrap">{order.customer.fullName}</td>
                    <td className="p-4 text-gray-400 font-mono text-xs">{order.customer.phone}</td>
                    <td className="p-4 text-gray-400 text-xs">{order.customer.governorate}</td>
                    <td className="p-4 text-gray-200 whitespace-nowrap font-medium">
                      EGP {order.total.toLocaleString()}
                    </td>
                    <td className="p-4 text-gray-400 text-center">
                      {order.items.reduce((s, i) => s + i.quantity, 0)}
                    </td>
                    <td className="p-4">
                      <select
                        value={order.status}
                        disabled={updatingStatus === order._id}
                        onChange={(e) => handleStatusChange(order._id, e.target.value as OrderStatus)}
                        className={`text-xs font-medium border rounded-full px-2.5 py-1 cursor-pointer focus:outline-none disabled:opacity-50 ${STATUS_COLORS[order.status]} bg-transparent`}
                      >
                        {ALL_STATUSES.map((s) => (
                          <option key={s} value={s} className="bg-gray-800 text-white">
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4 text-gray-500 text-xs whitespace-nowrap">
                      {fmt(new Date(order.createdAt), 'MMM d, HH:mm')}
                    </td>
                    <td className="p-4">
                      <Link
                        href={`/admin/orders/${order._id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg text-xs transition-colors"
                      >
                        <Eye size={12} />
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-gray-700 px-4 py-3 flex items-center justify-between">
            <p className="text-gray-500 text-sm">
              Page {page} of {totalPages} ({totalCount} orders)
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed text-gray-300 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                      pageNum === page
                        ? 'bg-[#C9A84C] text-[#111827]'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed text-gray-300 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
