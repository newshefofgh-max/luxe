'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Package, User, LogOut, ChevronRight, Clock, CheckCircle, Truck } from 'lucide-react';
import Navbar from '@/components/store/Navbar';
import Footer from '@/components/store/Footer';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import type { IOrder } from '@/types';

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  pending: { label: 'قيد الانتظار', className: 'bg-yellow-500/20 text-yellow-400' },
  confirmed: { label: 'مؤكد', className: 'bg-blue-500/20 text-blue-400' },
  shipped: { label: 'تم الشحن', className: 'bg-purple-500/20 text-purple-400' },
  delivered: { label: 'تم التسليم', className: 'bg-green-500/20 text-green-400' },
  cancelled: { label: 'ملغي', className: 'bg-red-500/20 text-red-400' },
};

export default function AccountPage() {
  const { currentUser, logout, isLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.replace('/');
    }
  }, [currentUser, isLoading, router]);

  useEffect(() => {
    if (!currentUser) return;
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('accessory_token');
        const { data } = await axios.get('/api/orders/mine', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(data.data?.orders ?? []);
      } catch {
        setOrders([]);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, [currentUser]);

  if (isLoading || !currentUser) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-page pt-20 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#E91E8C] border-t-transparent rounded-full" />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-page pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="md:col-span-1">
              <div className="card p-6 text-center mb-4" dir="rtl">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-[#E91E8C]/10 flex items-center justify-center">
                  <User className="text-[#E91E8C]" size={28} />
                </div>
                <p className="text-[var(--text)] font-semibold">{currentUser.name}</p>
                <p className="text-[var(--text-faint)] text-sm">{currentUser.email}</p>
              </div>
              <nav className="space-y-1">
                <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[var(--text)] bg-[#E91E8C]/10 border border-[#E91E8C]/30 rounded-sm">
                  <Package size={16} className="text-[#E91E8C]" />
                  طلباتي
                </button>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-sm transition-colors"
                >
                  <LogOut size={16} />
                  تسجيل الخروج
                </button>
              </nav>
            </div>

            {/* Orders */}
            <div className="md:col-span-3">
              <h2 className="text-[var(--text)] font-display text-2xl mb-6" dir="rtl">طلباتي</h2>

              {loadingOrders ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="card p-4 animate-pulse">
                      <div className="bg-surface h-4 rounded w-1/3 mb-2" />
                      <div className="bg-surface h-4 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="card p-12 text-center">
                  <Package className="text-[var(--text-faint)] mx-auto mb-4" size={48} />
                  <p className="text-[var(--text)] text-lg mb-2">لا توجد طلبات بعد</p>
                  <p className="text-[var(--text-faint)] text-sm mb-6">ابدأ التسوق وأضف منتجات إلى سلتك</p>
                  <Link href="/products" className="btn-primary">تسوق الآن</Link>
                </div>
              ) : (
                <div className="space-y-4" dir="rtl">
                  {orders.map((order) => {
                    const badge = STATUS_BADGE[order.status] ?? STATUS_BADGE.pending;
                    return (
                      <motion.div
                        key={order._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card p-5 hover:border-[#E91E8C]/40 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-[#E91E8C] font-bold font-mono">{order.orderNumber}</p>
                            <p className="text-[var(--text-faint)] text-xs mt-0.5">
                              {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                            </p>
                          </div>
                          <span className={`px-3 py-1 text-xs rounded-sm ${badge.className}`}>
                            {badge.label}
                          </span>
                        </div>
                        <p className="text-[var(--text-muted)] text-sm mb-3">
                          {order.items.length} منتج — {order.total} جنيه
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-[var(--text-faint)] text-xs">
                            {order.customer.governorate}، {order.customer.city}
                          </span>
                          <Link
                            href={`/orders/${order._id}`}
                            className="flex items-center gap-1 text-[#E91E8C] text-sm hover:underline"
                          >
                            تفاصيل الطلب
                            <ChevronRight size={14} />
                          </Link>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
