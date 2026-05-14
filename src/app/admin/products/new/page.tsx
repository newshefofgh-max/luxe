'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ProductForm from '@/components/admin/ProductForm';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: Record<string, unknown>) => {
    setLoading(true);
    const token = localStorage.getItem('admin_token');
    try {
      await axios.post('/api/products', data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('تم إضافة المنتج بنجاح! 🎉');
      router.push('/admin/products');
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error : 'فشل إضافة المنتج';
      toast.error(msg ?? 'فشل إضافة المنتج');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto" dir="rtl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/products" className="text-gray-400 hover:text-white">
          <ArrowRight size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-white">إضافة منتج جديد</h1>
      </div>
      <ProductForm onSubmit={handleSubmit as never} loading={loading} />
    </div>
  );
}
