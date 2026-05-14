'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { productSchema } from '@/lib/validators';
import ImageUpload from './ImageUpload';
import type { z } from 'zod';
import type { IProduct } from '@/types';

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: IProduct;
  onSubmit: (data: ProductFormData & { images: string[] }) => Promise<void>;
  loading?: boolean;
}

const CATEGORIES = [
  { value: 'bracelets', label: 'أساور' },
  { value: 'necklaces', label: 'قلادات' },
  { value: 'rings', label: 'خواتم' },
  { value: 'sunglasses', label: 'نظارات' },
];

export default function ProductForm({ product, onSubmit, loading = false }: ProductFormProps) {
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [variants, setVariants] = useState<
    { name: string; nameAr: string; options: { value: string; stock: number; priceModifier: number }[] }[]
  >(product?.variants ?? []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          name: product.name,
          nameAr: product.nameAr,
          slug: product.slug,
          description: product.description,
          descriptionAr: product.descriptionAr,
          price: product.price,
          comparePrice: product.comparePrice,
          category: product.category,
          stock: product.stock,
          isFeatured: product.isFeatured,
          tags: product.tags ?? [],
        }
      : { isFeatured: false, stock: 0 },
  });

  const nameValue = watch('name');

  const autoSlug = (name: string) =>
    name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!product) setValue('slug', autoSlug(e.target.value));
  };

  // Variants management
  const addVariant = () => {
    setVariants([...variants, { name: '', nameAr: '', options: [{ value: '', stock: 0, priceModifier: 0 }] }]);
  };

  const removeVariant = (i: number) => setVariants(variants.filter((_, idx) => idx !== i));

  const updateVariant = (i: number, field: string, value: string) => {
    const updated = [...variants];
    (updated[i] as Record<string, unknown>)[field] = value;
    setVariants(updated);
  };

  const addOption = (variantIdx: number) => {
    const updated = [...variants];
    updated[variantIdx].options.push({ value: '', stock: 0, priceModifier: 0 });
    setVariants(updated);
  };

  const removeOption = (variantIdx: number, optIdx: number) => {
    const updated = [...variants];
    updated[variantIdx].options = updated[variantIdx].options.filter((_, i) => i !== optIdx);
    setVariants(updated);
  };

  const updateOption = (
    variantIdx: number,
    optIdx: number,
    field: string,
    value: string | number
  ) => {
    const updated = [...variants];
    (updated[variantIdx].options[optIdx] as Record<string, unknown>)[field] = value;
    setVariants(updated);
  };

  const submit = handleSubmit(async (data) => {
    await onSubmit({ ...data, images, variants } as ProductFormData & { images: string[] });
  });

  return (
    <form onSubmit={submit} className="space-y-6" dir="rtl">
      {/* Images */}
      <div className="bg-gray-800 rounded-sm p-6 border border-gray-700">
        <h3 className="text-white font-semibold mb-4">صور المنتج</h3>
        <ImageUpload images={images} onChange={setImages} maxImages={6} />
      </div>

      {/* Basic info */}
      <div className="bg-gray-800 rounded-sm p-6 border border-gray-700">
        <h3 className="text-white font-semibold mb-4">المعلومات الأساسية</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">اسم المنتج (عربي) *</label>
            <input {...register('nameAr')} className="input bg-gray-900" placeholder="مثال: سوار ذهبي أنيق" />
            {errors.nameAr && <p className="text-red-400 text-xs mt-1">{errors.nameAr.message}</p>}
          </div>
          <div>
            <label className="label">Product Name (English) *</label>
            <input
              {...register('name')}
              className="input bg-gray-900"
              placeholder="e.g. Elegant Gold Bracelet"
              onChange={handleNameChange}
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label">Slug (URL) *</label>
            <input {...register('slug')} className="input bg-gray-900 font-mono text-sm" dir="ltr" />
            {errors.slug && <p className="text-red-400 text-xs mt-1">{errors.slug.message}</p>}
          </div>
          <div>
            <label className="label">التصنيف *</label>
            <select {...register('category')} className="input bg-gray-900">
              <option value="">اختر التصنيف</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category.message}</p>}
          </div>
          <div>
            <label className="label">السعر (جنيه) *</label>
            <input {...register('price', { valueAsNumber: true })} type="number" min="0" className="input bg-gray-900" />
            {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price.message}</p>}
          </div>
          <div>
            <label className="label">السعر قبل الخصم (اختياري)</label>
            <input {...register('comparePrice', { valueAsNumber: true })} type="number" min="0" className="input bg-gray-900" />
          </div>
          <div>
            <label className="label">المخزون *</label>
            <input {...register('stock', { valueAsNumber: true })} type="number" min="0" className="input bg-gray-900" />
            {errors.stock && <p className="text-red-400 text-xs mt-1">{errors.stock.message}</p>}
          </div>
          <div className="flex items-center gap-3 mt-6">
            <input {...register('isFeatured')} type="checkbox" id="featured" className="accent-[#C9A84C] w-4 h-4" />
            <label htmlFor="featured" className="text-white text-sm cursor-pointer">
              منتج مميز (Best Seller)
            </label>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">الوصف (عربي) *</label>
            <textarea {...register('descriptionAr')} rows={4} className="input bg-gray-900 resize-none" placeholder="وصف تفصيلي للمنتج..." />
            {errors.descriptionAr && <p className="text-red-400 text-xs mt-1">{errors.descriptionAr.message}</p>}
          </div>
          <div>
            <label className="label">Description (English) *</label>
            <textarea {...register('description')} rows={4} className="input bg-gray-900 resize-none" dir="ltr" placeholder="Detailed product description..." />
            {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
          </div>
        </div>
      </div>

      {/* Variants */}
      <div className="bg-gray-800 rounded-sm p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">المتغيرات (لون / مقاس)</h3>
          <button type="button" onClick={addVariant} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
            <Plus size={14} />
            إضافة متغير
          </button>
        </div>

        {variants.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-4">لا توجد متغيرات — اضغط إضافة متغير</p>
        )}

        {variants.map((variant, vi) => (
          <div key={vi} className="border border-gray-700 rounded-sm p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="grid grid-cols-2 gap-3 flex-1 ml-3">
                <input
                  value={variant.nameAr}
                  onChange={(e) => updateVariant(vi, 'nameAr', e.target.value)}
                  className="input bg-gray-900 text-sm"
                  placeholder="اسم المتغير (عربي) — مثال: اللون"
                />
                <input
                  value={variant.name}
                  onChange={(e) => updateVariant(vi, 'name', e.target.value)}
                  className="input bg-gray-900 text-sm"
                  placeholder="Variant Name — e.g. Color"
                  dir="ltr"
                />
              </div>
              <button type="button" onClick={() => removeVariant(vi)} className="text-red-400 hover:text-red-300">
                <Trash2 size={16} />
              </button>
            </div>

            <div className="space-y-2">
              {variant.options.map((opt, oi) => (
                <div key={oi} className="grid grid-cols-4 gap-2 items-center">
                  <input
                    value={opt.value}
                    onChange={(e) => updateOption(vi, oi, 'value', e.target.value)}
                    className="input bg-gray-900 text-sm col-span-2"
                    placeholder="القيمة (مثال: ذهبي)"
                  />
                  <input
                    type="number"
                    value={opt.stock}
                    onChange={(e) => updateOption(vi, oi, 'stock', parseInt(e.target.value))}
                    className="input bg-gray-900 text-sm"
                    placeholder="مخزون"
                    min="0"
                  />
                  <div className="flex gap-1">
                    <input
                      type="number"
                      value={opt.priceModifier}
                      onChange={(e) => updateOption(vi, oi, 'priceModifier', parseInt(e.target.value))}
                      className="input bg-gray-900 text-sm flex-1"
                      placeholder="±سعر"
                    />
                    <button type="button" onClick={() => removeOption(vi, oi)} className="text-red-400">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addOption(vi)}
                className="text-[#C9A84C] text-xs hover:underline flex items-center gap-1 mt-1"
              >
                <Plus size={12} /> إضافة خيار
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || images.length === 0}
        className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            جاري الحفظ...
          </>
        ) : (
          product ? 'حفظ التعديلات' : 'إضافة المنتج'
        )}
      </button>
      {images.length === 0 && (
        <p className="text-orange-400 text-xs text-center">* يجب رفع صورة واحدة على الأقل</p>
      )}
    </form>
  );
}
