'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { ShieldCheck, Truck, Tag, Phone, Loader2, CheckCircle } from 'lucide-react';
import Navbar from '@/components/store/Navbar';
import OTPModal from '@/components/ui/OTPModal';
import { useCart, useCartSubtotal } from '@/hooks/useCart';
import { checkoutSchema } from '@/lib/validators';
import { EGYPT_GOVERNORATES, EGYPT_CITIES } from '@/lib/egyptData';
import { calculateShippingFee } from '@/lib/shipping';
import axios from 'axios';
import toast from 'react-hot-toast';
import type { z } from 'zod';

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const subtotal = useCartSubtotal();

  const [selectedGovernorate, setSelectedGovernorate] = useState('');
  const [cities, setCities] = useState<string[]>([]);
  const [shippingFee, setShippingFee] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState('');
  const [couponError, setCouponError] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [phoneForOTP, setPhoneForOTP] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState<CheckoutFormData | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { paymentMethod: 'cod' },
  });

  const watchedGovernorate = watch('governorate');
  const watchedPhone = watch('phone');

  useEffect(() => {
    if (watchedGovernorate) {
      setSelectedGovernorate(watchedGovernorate);
      setCities(EGYPT_CITIES[watchedGovernorate] ?? []);
      setShippingFee(calculateShippingFee(watchedGovernorate));
    }
  }, [watchedGovernorate]);

  useEffect(() => {
    if (items.length === 0) {
      router.replace('/');
    }
  }, [items, router]);

  const total = subtotal + shippingFee - couponDiscount;

  const validateCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    setCouponMsg('');
    try {
      const { data } = await axios.post('/api/coupons/validate', {
        code: couponCode,
        cartTotal: subtotal,
      });
      setCouponDiscount(data.data.discountAmount);
      setCouponMsg(data.data.message);
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error : 'كود غير صالح';
      setCouponError(msg ?? 'كود غير صالح');
      setCouponDiscount(0);
    } finally {
      setCouponLoading(false);
    }
  };

  const onSubmit = async (formData: CheckoutFormData) => {
    if (!otpVerified) {
      setPhoneForOTP(watchedPhone);
      setPendingSubmit(formData);
      setShowOTP(true);
      return;
    }
    await placeOrder(formData);
  };

  const placeOrder = async (formData: CheckoutFormData) => {
    setSubmitting(true);
    try {
      const orderItems = items.map((item) => ({
        productId: item.product._id,
        quantity: item.quantity,
        selectedVariant: Object.values(item.selectedVariants ?? {})[0],
      }));

      const { data } = await axios.post('/api/orders', {
        ...formData,
        couponCode: couponDiscount > 0 ? couponCode : undefined,
        items: orderItems,
      });

      clearCart();
      toast.success('تم تقديم طلبك بنجاح! 🎉');
      router.push(`/orders/${data.data.orderId}`);
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error : 'حدث خطأ. حاول مرة أخرى.';
      toast.error(msg ?? 'حدث خطأ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOTPVerified = async () => {
    setShowOTP(false);
    setOtpVerified(true);
    if (pendingSubmit) {
      await placeOrder(pendingSubmit);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-page pt-20">
        {/* COD Banner */}
        <div className="bg-[#E91E8C] text-#ffffff py-3 text-center font-bold text-sm tracking-wide">
          🎉 الدفع عند الاستلام — ادفع لما البضاعة توصلك بالسلامة! 💛
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="font-display text-3xl text-[var(--text)] mb-8 text-center" dir="rtl">
            إتمام الطلب
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Form — 3/5 */}
            <div className="lg:col-span-3">
              <form onSubmit={handleSubmit(onSubmit)} dir="rtl" className="space-y-6">
                {/* Personal info */}
                <div className="card p-6">
                  <h2 className="text-theme-text font-semibold text-lg mb-4 flex items-center gap-2">
                    <Phone size={18} className="text-[#E91E8C]" />
                    بيانات التواصل
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">الاسم الكامل *</label>
                      <input {...register('fullName')} className="input" placeholder="مثال: أحمد محمد علي" />
                      {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName.message}</p>}
                    </div>
                    <div>
                      <label className="label flex items-center gap-2">
                        رقم الهاتف *
                        {otpVerified && <CheckCircle size={14} className="text-green-400" />}
                      </label>
                      <input
                        {...register('phone')}
                        className="input"
                        placeholder="01xxxxxxxxx"
                        dir="ltr"
                      />
                      {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
                    </div>
                    <div className="sm:col-span-2">
                      <label className="label">البريد الإلكتروني (اختياري)</label>
                      <input {...register('email')} type="email" className="input" placeholder="example@email.com" dir="ltr" />
                    </div>
                  </div>
                </div>

                {/* Shipping address */}
                <div className="card p-6">
                  <h2 className="text-theme-text font-semibold text-lg mb-4 flex items-center gap-2">
                    <Truck size={18} className="text-[#E91E8C]" />
                    عنوان الشحن
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">المحافظة *</label>
                      <select {...register('governorate')} className="input">
                        <option value="">اختر المحافظة</option>
                        {EGYPT_GOVERNORATES.map((gov) => (
                          <option key={gov} value={gov}>{gov}</option>
                        ))}
                      </select>
                      {errors.governorate && <p className="text-red-400 text-xs mt-1">{errors.governorate.message}</p>}
                    </div>
                    <div>
                      <label className="label">المدينة / الحي *</label>
                      <select {...register('city')} className="input" disabled={!selectedGovernorate}>
                        <option value="">اختر المدينة</option>
                        {cities.map((city) => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                      {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city.message}</p>}
                    </div>
                    <div className="sm:col-span-2">
                      <label className="label">العنوان التفصيلي *</label>
                      <textarea
                        {...register('address')}
                        className="input resize-none"
                        rows={3}
                        placeholder="مثال: شارع 9، بجوار مسجد الرحمن، الدور الثالث شقة 12"
                      />
                      {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address.message}</p>}
                    </div>
                    <div className="sm:col-span-2">
                      <label className="label">ملاحظات إضافية (اختياري)</label>
                      <textarea
                        {...register('notes')}
                        className="input resize-none"
                        rows={2}
                        placeholder="أي تعليمات خاصة للتوصيل..."
                      />
                    </div>
                  </div>
                </div>

                {/* Payment method */}
                <div className="card p-6">
                  <h2 className="text-theme-text font-semibold text-lg mb-4 flex items-center gap-2">
                    <ShieldCheck size={18} className="text-[#E91E8C]" />
                    طريقة الدفع
                  </h2>
                  <label className="flex items-center gap-3 p-4 border-2 border-[#E91E8C] rounded-sm cursor-pointer bg-[#E91E8C]/5">
                    <input {...register('paymentMethod')} type="radio" value="cod" defaultChecked className="accent-[#E91E8C]" />
                    <div>
                      <p className="text-theme-text font-semibold">💵 الدفع عند الاستلام (COD)</p>
                      <p className="text-[var(--text-faint)] text-sm">ادفع نقداً عند وصول طلبك</p>
                    </div>
                  </label>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      جاري تقديم الطلب...
                    </>
                  ) : (
                    '✅ تأكيد الطلب — الدفع عند الاستلام'
                  )}
                </button>
              </form>
            </div>

            {/* Order summary — 2/5 */}
            <div className="lg:col-span-2">
              <div className="card p-6 sticky top-24" dir="rtl">
                <h2 className="text-theme-text font-semibold text-lg mb-4">ملخص الطلب</h2>

                {/* Items */}
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.product._id} className="flex items-center gap-3">
                      {item.product.images[0] && (
                        <div className="relative w-14 h-14 bg-page rounded-sm overflow-hidden flex-shrink-0">
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.nameAr}
                            fill
                            className="object-cover"
                          />
                          <span className="absolute -top-1 -left-1 bg-[#E91E8C] text-#ffffff text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                            {item.quantity}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[var(--text)] text-sm truncate">{item.product.nameAr}</p>
                        <p className="text-[var(--text-faint)] text-xs">
                          {item.quantity} × {item.product.price} جنيه
                        </p>
                      </div>
                      <span className="text-[var(--text)] text-sm font-medium">
                        {item.product.price * item.quantity} جنيه
                      </span>
                    </div>
                  ))}
                </div>

                {/* Coupon */}
                <div className="border-t border-theme-border pt-4 mb-4">
                  <label className="label flex items-center gap-2">
                    <Tag size={14} className="text-[#E91E8C]" />
                    كود خصم
                  </label>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="أدخل الكود"
                      className="input flex-1 text-sm"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={validateCoupon}
                      disabled={couponLoading || !couponCode}
                      className="btn-secondary px-3 py-2 text-xs disabled:opacity-50"
                    >
                      {couponLoading ? '...' : 'تطبيق'}
                    </button>
                  </div>
                  {couponMsg && <p className="text-green-400 text-xs mt-1">{couponMsg}</p>}
                  {couponError && <p className="text-red-400 text-xs mt-1">{couponError}</p>}
                </div>

                {/* Totals */}
                <div className="border-t border-theme-border pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-[var(--text-faint)]">
                    <span>المجموع الفرعي</span>
                    <span>{subtotal} جنيه</span>
                  </div>
                  {selectedGovernorate && (
                    <div className="flex justify-between text-sm text-[var(--text-faint)]">
                      <span>الشحن إلى {selectedGovernorate}</span>
                      <span>{shippingFee} جنيه</span>
                    </div>
                  )}
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-400">
                      <span>خصم الكوبون</span>
                      <span>-{couponDiscount} جنيه</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold text-[var(--text)] border-t border-theme-border pt-2">
                    <span>الإجمالي</span>
                    <span className="text-[#E91E8C]">{total} جنيه</span>
                  </div>
                </div>

                {/* COD badge */}
                <div className="mt-4 bg-[#E91E8C]/10 border border-[#E91E8C]/30 rounded-sm p-3 text-center">
                  <p className="text-[#E91E8C] text-sm font-semibold">💛 الدفع عند الاستلام</p>
                  <p className="text-[var(--text-faint)] text-xs mt-0.5">لا حاجة لبطاقة بنكية</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <OTPModal
        isOpen={showOTP}
        phone={phoneForOTP}
        onVerified={handleOTPVerified}
        onClose={() => setShowOTP(false)}
      />
    </>
  );
}
