'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  CheckCircle, Clock, Package, Truck, Home, MessageCircle, Phone
} from 'lucide-react';
import Navbar from '@/components/store/Navbar';
import Footer from '@/components/store/Footer';
import axios from 'axios';
import type { IOrder } from '@/types';

const STATUS_CONFIG = {
  pending: {
    label: 'قيد الانتظار',
    labelEn: 'Pending',
    icon: Clock,
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10 border-yellow-400/30',
    step: 0,
  },
  confirmed: {
    label: 'مؤكد',
    labelEn: 'Confirmed',
    icon: CheckCircle,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10 border-blue-400/30',
    step: 1,
  },
  shipped: {
    label: 'تم الشحن',
    labelEn: 'Shipped',
    icon: Truck,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10 border-purple-400/30',
    step: 2,
  },
  delivered: {
    label: 'تم التسليم',
    labelEn: 'Delivered',
    icon: Home,
    color: 'text-green-400',
    bg: 'bg-green-400/10 border-green-400/30',
    step: 3,
  },
  cancelled: {
    label: 'ملغي',
    labelEn: 'Cancelled',
    icon: Clock,
    color: 'text-red-400',
    bg: 'bg-red-400/10 border-red-400/30',
    step: -1,
  },
};

const TIMELINE_STEPS = [
  { key: 'pending', label: 'تم الاستلام', icon: Package },
  { key: 'confirmed', label: 'مؤكد', icon: CheckCircle },
  { key: 'shipped', label: 'في الطريق', icon: Truck },
  { key: 'delivered', label: 'تم التسليم', icon: Home },
];

export default function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await axios.get(`/api/orders/${id}`);
        setOrder(data.data?.order);
      } catch {
        setError('لم يتم العثور على الطلب');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-page pt-20 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#E91E8C] border-t-transparent rounded-full" />
        </div>
        <Footer />
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-page pt-20 flex flex-col items-center justify-center gap-4">
          <p className="text-red-400 text-lg">{error}</p>
          <Link href="/" className="btn-primary">العودة للرئيسية</Link>
        </div>
        <Footer />
      </>
    );
  }

  const statusConfig = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
  const currentStep = statusConfig.step;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-page pt-20">
        <div className="max-w-3xl mx-auto px-4 py-12">
          {/* Success header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#E91E8C]/10 flex items-center justify-center">
              <CheckCircle className="text-[#E91E8C]" size={40} />
            </div>
            <h1 className="font-display text-3xl text-[var(--text)] mb-2">شكراً لطلبك! 💛</h1>
            <p className="text-[var(--text-faint)]">
              سيتم التواصل معك قريباً على WhatsApp لتأكيد الطلب
            </p>
          </motion.div>

          {/* Order number */}
          <div className="card p-6 mb-6 text-center" dir="rtl">
            <p className="text-[var(--text-faint)] text-sm mb-1">رقم الطلب</p>
            <p className="text-[#E91E8C] text-2xl font-bold font-mono">{order.orderNumber}</p>
            <div className={`inline-flex items-center gap-2 mt-3 px-4 py-1.5 rounded-sm border text-sm ${statusConfig.bg} ${statusConfig.color}`}>
              <statusConfig.icon size={14} />
              {statusConfig.label}
            </div>
          </div>

          {/* Status timeline */}
          {order.status !== 'cancelled' && (
            <div className="card p-6 mb-6">
              <h2 className="text-[var(--text)] font-semibold mb-6 text-center">حالة الطلب</h2>
              <div className="flex items-center justify-between relative">
                {/* Progress line */}
                <div className="absolute top-5 left-8 right-8 h-0.5 bg-[#2a2a4a]" />
                <div
                  className="absolute top-5 left-8 h-0.5 bg-[#E91E8C] transition-all duration-500"
                  style={{ width: `${(currentStep / 3) * 100}%`, right: 'auto' }}
                />
                {TIMELINE_STEPS.map((step, i) => {
                  const isCompleted = i <= currentStep;
                  const isCurrent = i === currentStep;
                  return (
                    <div key={step.key} className="relative flex flex-col items-center z-10">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                          isCompleted
                            ? 'bg-[#E91E8C] border-[#E91E8C] text-#ffffff'
                            : 'bg-page border-theme-border text-[var(--text-faint)]'
                        } ${isCurrent ? 'ring-2 ring-[#E91E8C]/40 ring-offset-2 ring-offset-[#111122]' : ''}`}
                      >
                        <step.icon size={16} />
                      </motion.div>
                      <p className={`text-xs mt-2 text-center ${isCompleted ? 'text-[#E91E8C]' : 'text-[var(--text-faint)]'}`}>
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tracking */}
          {order.trackingNumber && (
            <div className="card p-4 mb-6 flex items-center gap-3" dir="rtl">
              <Truck className="text-[#E91E8C]" size={20} />
              <div>
                <p className="text-[var(--text)] text-sm font-medium">رقم التتبع</p>
                <p className="text-[#E91E8C] font-mono text-sm">{order.trackingNumber}</p>
              </div>
            </div>
          )}

          {/* Customer details */}
          <div className="card p-6 mb-6" dir="rtl">
            <h2 className="text-[var(--text)] font-semibold mb-4">تفاصيل التسليم</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--text-faint)]">الاسم</span>
                <span className="text-[var(--text)]">{order.customer.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-faint)]">الهاتف</span>
                <span className="text-[var(--text)] font-mono" dir="ltr">{order.customer.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-faint)]">العنوان</span>
                <span className="text-[var(--text)] text-right max-w-[60%]">
                  {order.customer.address}، {order.customer.city}، {order.customer.governorate}
                </span>
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div className="card p-6 mb-6" dir="rtl">
            <h2 className="text-[var(--text)] font-semibold mb-4">المنتجات المطلوبة</h2>
            <div className="space-y-3 mb-4">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <div>
                    <p className="text-[var(--text)]">{item.productNameAr}</p>
                    <p className="text-[var(--text-faint)] text-xs">{item.quantity} × {item.price} جنيه</p>
                  </div>
                  <span className="text-[var(--text)]">{item.price * item.quantity} جنيه</span>
                </div>
              ))}
            </div>
            <div className="border-t border-theme-border pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-[var(--text-faint)]">
                <span>مجموع المنتجات</span>
                <span>{order.subtotal} جنيه</span>
              </div>
              <div className="flex justify-between text-[var(--text-faint)]">
                <span>الشحن</span>
                <span>{order.shippingFee} جنيه</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>خصم</span>
                  <span>-{order.discount} جنيه</span>
                </div>
              )}
              <div className="flex justify-between text-[var(--text)] font-bold text-base border-t border-theme-border pt-2">
                <span>الإجمالي</span>
                <span className="text-[#E91E8C]">{order.total} جنيه</span>
              </div>
              <p className="text-center text-[var(--text-faint)] text-xs">
                💵 يُدفع نقداً عند الاستلام
              </p>
            </div>
          </div>

          {/* WhatsApp support */}
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=استفسار عن طلب رقم ${order.orderNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#25D366] text-[var(--text)] font-semibold rounded-sm hover:bg-[#20bc5a] transition-colors"
            >
              <MessageCircle size={18} />
              تواصل معنا على WhatsApp
            </a>
            <Link href="/products" className="flex-1 btn-secondary text-center py-3 flex items-center justify-center gap-2">
              <Phone size={18} />
              متابعة التسوق
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
