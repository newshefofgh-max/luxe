'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ProductForm from '@/components/admin/ProductForm';
import axios from 'axios';
import toast from 'react-hot-toast';
import type { IProduct } from '@/types';

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await axios.get(`/api/products/${id}`);
        setProduct(data.data?.product);
      } catch {
        toast.error('لم يتم العثور على المنتج');
        router.push('/admin/products');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, router]);

  const handleSubmit = async (data: Record<string, unknown>) => {
    setSaving(true);
    const token = localStorage.getItem('admin_token');
    try {
      await axios.put(`/api/products/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('تم حفظ التعديلات بنجاح!');
      router.push('/admin/products');
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error : 'فشل الحفظ';
      toast.error(msg ?? 'فشل الحفظ');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#C9A84C] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="p-6 max-w-4xl mx-auto" dir="rtl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/products" className="text-gray-400 hover:text-white">
          <ArrowRight size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-white">تعديل: {product.nameAr}</h1>
      </div>
      <ProductForm product={product} onSubmit={handleSubmit as never} loading={saving} />
    </div>
  );
}
