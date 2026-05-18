'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '@/components/store/Navbar';
import Footer from '@/components/store/Footer';
import ProductGrid from '@/components/store/ProductGrid';
import axios from 'axios';
import type { IProduct } from '@/types';

const DEFAULT_CATEGORIES = [
  { value: '', label: 'الكل', labelEn: 'All' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'الأحدث' },
  { value: 'price_asc', label: 'السعر: من الأقل' },
  { value: 'price_desc', label: 'السعر: من الأعلى' },
  { value: 'popular', label: 'الأكثر مبيعاً' },
];

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<IProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);

  useEffect(() => {
    fetch('/api/content')
      .then((r) => r.json())
      .then((data) => {
        const nav: { slug: string; ar: string; en: string }[] = data.data?.nav_categories ?? [];
        if (nav.length > 0) {
          setCategories([
            { value: '', label: 'الكل', labelEn: 'All' },
            ...nav.map((c) => ({ value: c.slug, label: c.ar, labelEn: c.en })),
          ]);
        }
      })
      .catch(() => {});
  }, []);

  const category = searchParams.get('category') ?? '';
  const search = searchParams.get('search') ?? '';
  const sort = searchParams.get('sort') ?? 'newest';
  const page = parseInt(searchParams.get('page') ?? '1');
  const minPrice = searchParams.get('minPrice') ?? '';
  const maxPrice = searchParams.get('maxPrice') ?? '';

  const [searchInput, setSearchInput] = useState(search);
  const [priceMin, setPriceMin] = useState(minPrice);
  const [priceMax, setPriceMax] = useState(maxPrice);

  const LIMIT = 12;
  const pages = Math.ceil(total / LIMIT);

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete('page');
      router.push(`/products?${params.toString()}`);
    },
    [searchParams, router]
  );

  const setPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(p));
    router.push(`/products?${params.toString()}`);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params: Record<string, string> = {
          page: String(page),
          limit: String(LIMIT),
          sort,
        };
        if (category) params.category = category;
        if (search) params.search = search;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;

        const { data } = await axios.get('/api/products', { params });
        setProducts(data.data?.products ?? []);
        setTotal(data.data?.total ?? 0);
      } catch {
        setProducts([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category, search, sort, page, minPrice, maxPrice]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam('search', searchInput);
  };

  const applyPriceFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (priceMin) params.set('minPrice', priceMin); else params.delete('minPrice');
    if (priceMax) params.set('maxPrice', priceMax); else params.delete('maxPrice');
    params.delete('page');
    router.push(`/products?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push('/products');
    setSearchInput('');
    setPriceMin('');
    setPriceMax('');
  };

  const hasActiveFilters = category || search || minPrice || maxPrice;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-page pt-20">
        {/* Header */}
        <div className="bg-surface-alt border-b border-theme-border py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="font-display text-3xl md:text-4xl text-[var(--text)] mb-2">المنتجات</h1>
            <p className="text-[var(--text-faint)]">
              {loading ? '...' : `${total} منتج`}
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search + Sort bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)]" size={18} />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="ابحث عن منتج..."
                  className="input pr-10"
                  dir="rtl"
                />
              </div>
              <button type="submit" className="btn-primary px-4 py-2">بحث</button>
            </form>

            <div className="flex gap-2">
              <select
                value={sort}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="input w-auto"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-secondary flex items-center gap-2 px-4"
              >
                <SlidersHorizontal size={16} />
                فلتر
              </button>
            </div>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="card p-6 mb-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Category */}
                <div>
                  <label className="label">التصنيف</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => updateParam('category', cat.value)}
                        className={`px-4 py-1.5 text-sm rounded-sm border transition-colors ${
                          category === cat.value
                            ? 'bg-[#E91E8C] text-white border-[#E91E8C]'
                            : 'border-theme-border text-[var(--text-faint)] hover:border-[#E91E8C] hover:text-[var(--text)]'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price range */}
                <div>
                  <label className="label">نطاق السعر (جنيه)</label>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="number"
                      placeholder="من"
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                      className="input w-24"
                      min="0"
                    />
                    <span className="text-[var(--text-faint)]">—</span>
                    <input
                      type="number"
                      placeholder="إلى"
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                      className="input w-24"
                      min="0"
                    />
                    <button onClick={applyPriceFilter} className="btn-primary px-3 py-2 text-xs">
                      تطبيق
                    </button>
                  </div>
                </div>

                {/* Clear */}
                {hasActiveFilters && (
                  <div className="flex items-end">
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm"
                    >
                      <X size={14} />
                      مسح الفلاتر
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Category tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => updateParam('category', cat.value)}
                className={`whitespace-nowrap px-5 py-2 text-sm rounded-sm border transition-colors ${
                  category === cat.value
                    ? 'bg-[#E91E8C] text-white border-[#E91E8C] font-semibold'
                    : 'border-theme-border text-[var(--text-faint)] hover:border-[#E91E8C] hover:text-[var(--text)]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Products grid */}
          <ProductGrid products={products} loading={loading} columns={4} />

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="p-2 border border-theme-border rounded-sm disabled:opacity-30 hover:border-[#E91E8C] transition-colors"
              >
                <ChevronRight size={18} />
              </button>

              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 text-sm rounded-sm border transition-colors ${
                    p === page
                      ? 'bg-[#E91E8C] text-white border-[#E91E8C] font-bold'
                      : 'border-theme-border text-[var(--text-faint)] hover:border-[#E91E8C]'
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= pages}
                className="p-2 border border-theme-border rounded-sm disabled:opacity-30 hover:border-[#E91E8C] transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}


export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-page" />}>
      <ProductsContent />
    </Suspense>
  );
}
