'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, ToggleLeft, ToggleRight, X, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import type { ICoupon } from '@/types';

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
});

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<ICoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: '',
    minOrderValue: '',
    maxUses: '',
    expiresAt: '',
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchCoupons = async () => {
    try {
      const { data } = await axios.get('/api/coupons', { headers: authHeader() });
      setCoupons(data.data?.coupons ?? []);
    } catch {
      toast.error('فشل تحميل الكوبونات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const code = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    setForm((f) => ({ ...f, code }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.value) return;
    setSaving(true);
    try {
      await axios.post(
        '/api/coupons',
        {
          code: form.code.toUpperCase(),
          discountType: form.type,
          discountValue: parseFloat(form.value),
          minOrderValue: parseFloat(form.minOrderValue || '0'),
          maxUses: form.maxUses ? parseInt(form.maxUses) : undefined,
          expiresAt: form.expiresAt || undefined,
          isActive: form.isActive,
        },
        { headers: authHeader() }
      );
      toast.success('تم إنشاء الكوبون بنجاح!');
      setShowModal(false);
      setForm({ code: '', type: 'percentage', value: '', minOrderValue: '', maxUses: '', expiresAt: '', isActive: true });
      fetchCoupons();
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error : 'فشل الإنشاء';
      toast.error(msg ?? 'فشل الإنشاء');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (coupon: ICoupon) => {
    try {
      await axios.patch(`/api/coupons/${coupon._id}`, { isActive: !coupon.isActive }, { headers: authHeader() });
      setCoupons((prev) =>
        prev.map((c) => (c._id === coupon._id ? { ...c, isActive: !c.isActive } : c))
      );
    } catch {
      toast.error('فشل تحديث الكوبون');
    }
  };

  const deleteCoupon = async (id: string) => {
    try {
      await axios.delete(`/api/coupons/${id}`, { headers: authHeader() });
      setCoupons((prev) => prev.filter((c) => c._id !== id));
      toast.success('تم حذف الكوبون');
    } catch {
      toast.error('فشل حذف الكوبون');
    }
    setDeleteConfirm(null);
  };

  return (
    <div className="p-6" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">كوبونات الخصم</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          كوبون جديد
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-[#C9A84C] border-t-transparent rounded-full mx-auto" />
        </div>
      ) : (
        <div className="bg-gray-800 rounded-sm border border-gray-700 overflow-hidden">
          <table className="w-full text-sm text-right">
            <thead className="bg-gray-900">
              <tr className="border-b border-gray-700 text-gray-400">
                <th className="py-3 px-4 font-medium">الكود</th>
                <th className="py-3 px-4 font-medium">النوع / القيمة</th>
                <th className="py-3 px-4 font-medium">الحد الأدنى</th>
                <th className="py-3 px-4 font-medium">الاستخدامات</th>
                <th className="py-3 px-4 font-medium">الانتهاء</th>
                <th className="py-3 px-4 font-medium">الحالة</th>
                <th className="py-3 px-4 font-medium">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    لا توجد كوبونات. أنشئ كوبوناً جديداً.
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon._id} className="hover:bg-gray-750 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-[#C9A84C]">{coupon.code}</span>
                    </td>
                    <td className="py-3 px-4 text-white">
                      {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `${coupon.discountValue} جنيه`}
                    </td>
                    <td className="py-3 px-4 text-gray-300">{coupon.minOrderValue} جنيه</td>
                    <td className="py-3 px-4 text-gray-300">
                      {coupon.usedCount}/{coupon.maxUses ?? '∞'}
                    </td>
                    <td className="py-3 px-4 text-gray-300">
                      {coupon.expiresAt
                        ? new Date(coupon.expiresAt).toLocaleDateString('ar-EG')
                        : 'بلا انتهاء'}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggleActive(coupon)}
                        className={`flex items-center gap-1 text-sm ${coupon.isActive ? 'text-green-400' : 'text-gray-500'}`}
                      >
                        {coupon.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                        {coupon.isActive ? 'نشط' : 'معطل'}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => setDeleteConfirm(coupon._id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/70"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-gray-800 border border-gray-700 rounded-sm p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-bold">إنشاء كوبون خصم</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4" dir="rtl">
                <div>
                  <label className="label">كود الخصم *</label>
                  <div className="flex gap-2">
                    <input
                      value={form.code}
                      onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                      className="input bg-gray-900 flex-1 font-mono"
                      placeholder="SUMMER20"
                      dir="ltr"
                      required
                    />
                    <button type="button" onClick={generateCode} className="btn-secondary px-3 text-xs">
                      توليد
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">نوع الخصم *</label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as 'percentage' | 'fixed' }))}
                      className="input bg-gray-900"
                    >
                      <option value="percentage">نسبة مئوية %</option>
                      <option value="fixed">مبلغ ثابت (جنيه)</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">
                      القيمة * {form.type === 'percentage' ? '(%)' : '(جنيه)'}
                    </label>
                    <input
                      type="number"
                      value={form.value}
                      onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                      className="input bg-gray-900"
                      min="1"
                      max={form.type === 'percentage' ? '100' : undefined}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">حد أدنى للطلب (جنيه)</label>
                    <input
                      type="number"
                      value={form.minOrderValue}
                      onChange={(e) => setForm((f) => ({ ...f, minOrderValue: e.target.value }))}
                      className="input bg-gray-900"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="label">أقصى استخدام</label>
                    <input
                      type="number"
                      value={form.maxUses}
                      onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))}
                      className="input bg-gray-900"
                      min="1"
                      placeholder="غير محدود"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">تاريخ الانتهاء (اختياري)</label>
                  <input
                    type="datetime-local"
                    value={form.expiresAt}
                    onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                    className="input bg-gray-900"
                    dir="ltr"
                  />
                </div>

                <button type="submit" disabled={saving} className="btn-primary w-full disabled:opacity-50">
                  {saving ? 'جاري الإنشاء...' : 'إنشاء الكوبون'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete confirm modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirm(null)}
              className="absolute inset-0 bg-black/70"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-gray-800 border border-gray-700 rounded-sm p-6 w-full max-w-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle size={18} className="text-red-400" />
                </div>
                <h3 className="text-white font-bold">حذف الكوبون؟</h3>
              </div>
              <p className="text-gray-400 text-sm mb-5" dir="rtl">
                لا يمكن التراجع عن هذا الإجراء. سيتم حذف الكوبون نهائياً.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => deleteCoupon(deleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded text-sm font-medium transition-colors"
                >
                  حذف
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
