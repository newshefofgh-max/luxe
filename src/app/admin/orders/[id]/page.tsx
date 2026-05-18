'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  MessageCircle,
  Clipboard,
  AlertTriangle,
  CreditCard,
  Hash,
} from 'lucide-react';
import { IOrder, OrderStatus } from '@/types';

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


const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  confirmed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  shipped: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  delivered: 'bg-green-500/20 text-green-400 border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const STATUS_ICONS: Record<OrderStatus, React.ElementType> = {
  pending: Clock,
  confirmed: CheckCircle,
  shipped: Truck,
  delivered: Package,
  cancelled: XCircle,
};

const STATUS_FLOW: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered'];

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<IOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [statusNote, setStatusNote] = useState('');

  const fetchOrder = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.data);
        setTrackingNumber(data.data.trackingNumber || '');
      }
    } catch {}
    setIsLoading(false);
  };

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  const updateStatus = async (newStatus: OrderStatus, note?: string, reason?: string) => {
    if (!order) return;
    setUpdating(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`/api/orders/${order._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          note: note || statusNote,
          cancelReason: reason || cancelReason,
          trackingNumber: newStatus === 'shipped' ? trackingNumber : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.data);
        setShowCancelModal(false);
        setCancelReason('');
        setStatusNote('');
      }
    } catch {}
    setUpdating(false);
  };

  const saveTracking = async () => {
    if (!order || !trackingNumber.trim()) return;
    setUpdating(true);
    try {
      const token = localStorage.getItem('admin_token');
      await fetch(`/api/orders/${order._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ trackingNumber }),
      });
      fetchOrder();
    } catch {}
    setUpdating(false);
  };

  const sendWhatsApp = () => {
    if (!order) return;
    const msg = `مرحباً ${order.customer.fullName}،\nطلبك رقم #${order.orderNumber} ${
      order.status === 'confirmed' ? 'تم تأكيده' :
      order.status === 'shipped' ? `تم شحنه - رقم التتبع: ${order.trackingNumber || 'قريباً'}` :
      order.status === 'delivered' ? 'تم توصيله' : 'تم استلامه'
    }.\nشكراً لتعاملك مع Accessory.`;
    const phone = order.customer.phone.replace(/\D/g, '');
    const formattedPhone = phone.startsWith('0') ? '2' + phone : phone;
    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">Order not found</p>
        <Link href="/admin/orders" className="text-[#C9A84C] text-sm mt-2 inline-block hover:underline">
          Back to orders
        </Link>
      </div>
    );
  }

  const currentStatusIndex = STATUS_FLOW.indexOf(order.status);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg bg-[#1f2937] border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              Order #{order.orderNumber}
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[order.status]}`}>
                {order.status}
              </span>
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {fmt(new Date(order.createdAt), 'MMMM d, yyyy — HH:mm')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={sendWhatsApp}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <MessageCircle size={15} />
            WhatsApp
          </button>
        </div>
      </div>

      {/* Status flow */}
      {order.status !== 'cancelled' && (
        <div className="bg-[#1f2937] border border-gray-700 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4 text-sm">Update Status</h3>
          <div className="flex items-center gap-2 flex-wrap">
            {STATUS_FLOW.map((status, idx) => {
              const Icon = STATUS_ICONS[status];
              const isCompleted = idx <= currentStatusIndex;
              const isCurrent = idx === currentStatusIndex;
              const isNext = idx === currentStatusIndex + 1;

              return (
                <div key={status} className="flex items-center gap-2">
                  <button
                    onClick={() => !isCompleted && isNext && updateStatus(status)}
                    disabled={updating || isCompleted || !isNext}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isCurrent
                        ? `${STATUS_COLORS[status]} border font-bold`
                        : isCompleted
                        ? 'bg-gray-700 text-gray-400 cursor-default'
                        : isNext
                        ? 'bg-[#C9A84C] hover:bg-[#b8963e] text-[#111827] cursor-pointer'
                        : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    <Icon size={14} />
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                  {idx < STATUS_FLOW.length - 1 && (
                    <div className={`w-8 h-0.5 ${idx < currentStatusIndex ? 'bg-[#C9A84C]' : 'bg-gray-700'}`} />
                  )}
                </div>
              );
            })}

            {(order.status as string) !== 'cancelled' && (order.status as string) !== 'delivered' && (
              <button
                onClick={() => setShowCancelModal(true)}
                disabled={updating}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-colors ml-4"
              >
                <XCircle size={14} />
                Cancel Order
              </button>
            )}
          </div>

          {/* Tracking number for shipped */}
          {(order.status === 'shipped' || order.status === 'confirmed') && (
            <div className="mt-4 flex items-center gap-3">
              <div className="relative flex-1 max-w-64">
                <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Tracking number..."
                  className="w-full bg-[#111827] border border-gray-600 rounded-lg pl-9 pr-3 py-2 text-white text-sm focus:outline-none focus:border-[#C9A84C] transition-colors"
                />
              </div>
              <button
                onClick={saveTracking}
                disabled={updating || !trackingNumber.trim()}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                Save Tracking
              </button>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Order items */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-[#1f2937] border border-gray-700 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Package size={16} className="text-[#C9A84C]" />
              Order Items ({order.items.reduce((s, i) => s + i.quantity, 0)} items)
            </h3>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-[#111827] rounded-lg">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-700 flex-shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <Package size={20} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{item.productName}</p>
                    {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                      <p className="text-gray-500 text-xs mt-0.5">
                        {Object.entries(item.selectedVariants).map(([k, v]) => `${k}: ${v}`).join(', ')}
                      </p>
                    )}
                    <p className="text-gray-500 text-xs mt-0.5">
                      EGP {item.price.toLocaleString()} × {item.quantity}
                    </p>
                  </div>
                  <p className="text-[#C9A84C] font-semibold text-sm whitespace-nowrap">
                    EGP {(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            {/* Price breakdown */}
            <div className="border-t border-gray-700 mt-4 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Subtotal</span>
                <span>EGP {order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span>Shipping</span>
                <span>EGP {order.shippingFee.toLocaleString()}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm text-green-400">
                  <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
                  <span>- EGP {order.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-white border-t border-gray-700 pt-2 mt-2">
                <span>Total</span>
                <span>EGP {order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-[#1f2937] border border-gray-700 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Clock size={16} className="text-[#C9A84C]" />
              Order Timeline
            </h3>
            <div className="space-y-0">
              {order.statusHistory.map((entry, i) => {
                const Icon = STATUS_ICONS[entry.status] || Clock;
                return (
                  <div key={i} className="flex gap-3 relative">
                    {i < order.statusHistory.length - 1 && (
                      <div className="absolute left-4 top-8 bottom-0 w-px bg-gray-700" />
                    )}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${STATUS_COLORS[entry.status]}`}>
                      <Icon size={14} />
                    </div>
                    <div className="pb-5">
                      <p className="text-white text-sm font-medium capitalize">{entry.status}</p>
                      {entry.note && <p className="text-gray-500 text-xs">{entry.note}</p>}
                      <p className="text-gray-600 text-xs mt-0.5">
                        {fmt(new Date(entry.timestamp), 'MMM d, yyyy — HH:mm')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar info */}
        <div className="space-y-5">
          {/* Customer info */}
          <div className="bg-[#1f2937] border border-gray-700 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <User size={16} className="text-[#C9A84C]" />
              Customer
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <User size={14} className="text-gray-500 flex-shrink-0" />
                <span className="text-gray-200">{order.customer.fullName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone size={14} className="text-gray-500 flex-shrink-0" />
                <a
                  href={`tel:${order.customer.phone}`}
                  className="text-[#C9A84C] hover:underline"
                >
                  {order.customer.phone}
                </a>
              </div>
              {order.customer.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail size={14} className="text-gray-500 flex-shrink-0" />
                  <span className="text-gray-400 text-xs break-all">{order.customer.email}</span>
                </div>
              )}
              <div className="flex items-start gap-2 text-sm">
                <MapPin size={14} className="text-gray-500 flex-shrink-0 mt-0.5" />
                <div className="text-gray-400 text-xs">
                  <p>{order.customer.address}</p>
                  <p>{order.customer.city}, {order.customer.governorate}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment info */}
          <div className="bg-[#1f2937] border border-gray-700 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <CreditCard size={16} className="text-[#C9A84C]" />
              Payment
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Method</span>
                <span className="text-gray-200 uppercase font-medium">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">OTP Verified</span>
                <span className={order.otpVerified ? 'text-green-400' : 'text-red-400'}>
                  {order.otpVerified ? 'Yes' : 'No'}
                </span>
              </div>
              {order.trackingNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Tracking</span>
                  <span className="text-[#C9A84C] font-mono text-xs">{order.trackingNumber}</span>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-[#1f2937] border border-gray-700 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2 text-sm">
                <Clipboard size={14} className="text-[#C9A84C]" />
                Customer Notes
              </h3>
              <p className="text-gray-400 text-sm">{order.notes}</p>
            </div>
          )}

          {/* Cancel reason */}
          {order.status === 'cancelled' && order.cancelReason && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5">
              <h3 className="text-red-400 font-semibold mb-2 flex items-center gap-2 text-sm">
                <AlertTriangle size={14} />
                Cancellation Reason
              </h3>
              <p className="text-gray-400 text-sm">{order.cancelReason}</p>
            </div>
          )}
        </div>
      </div>

      {/* Cancel modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1f2937] border border-gray-700 rounded-2xl p-6 w-full max-w-md"
          >
            <h3 className="text-white font-bold text-lg mb-2">Cancel Order</h3>
            <p className="text-gray-400 text-sm mb-4">
              Please provide a reason for cancellation.
            </p>
            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full bg-[#111827] border border-gray-600 rounded-lg px-3 py-2 text-white text-sm mb-3 focus:outline-none focus:border-[#C9A84C]"
            >
              <option value="">Select reason...</option>
              <option value="Customer requested cancellation">Customer requested cancellation</option>
              <option value="Fake order / no response">Fake order / no response</option>
              <option value="Out of stock">Out of stock</option>
              <option value="Wrong phone number">Wrong phone number</option>
              <option value="Duplicate order">Duplicate order</option>
              <option value="Other">Other</option>
            </select>
            {cancelReason === 'Other' && (
              <textarea
                placeholder="Enter custom reason..."
                className="w-full bg-[#111827] border border-gray-600 rounded-lg px-3 py-2 text-white text-sm mb-3 focus:outline-none focus:border-[#C9A84C] resize-none"
                rows={3}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
              >
                Keep Order
              </button>
              <button
                onClick={() => updateStatus('cancelled', undefined, cancelReason)}
                disabled={!cancelReason || updating}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {updating ? 'Cancelling...' : 'Cancel Order'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
