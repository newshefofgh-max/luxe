'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, Zap, ChevronLeft, Star, Shield, Truck, RefreshCw, Minus, Plus
} from 'lucide-react';
import Navbar from '@/components/store/Navbar';
import Footer from '@/components/store/Footer';
import ProductGrid from '@/components/store/ProductGrid';
import { useCart } from '@/hooks/useCart';
import axios from 'axios';
import toast from 'react-hot-toast';
import type { IProduct } from '@/types';
import Link from 'next/link';

const CATEGORY_AR: Record<string, string> = {
  bracelets: 'أساور',
  necklaces: 'قلادات',
  rings: 'خواتم',
  sunglasses: 'نظارات',
};

function getCategoryLabel(slug: string, navCategories: { slug: string; ar: string }[]): string {
  const found = navCategories.find((c) => c.slug === slug);
  return found?.ar ?? CATEGORY_AR[slug] ?? slug;
}

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { addItem, openCart } = useCart();

  const [product, setProduct] = useState<IProduct | null>(null);
  const [related, setRelated] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');
  const [adding, setAdding] = useState(false);
  const [navCategories, setNavCategories] = useState<{ slug: string; ar: string }[]>([]);
  const [reviews, setReviews] = useState<{ id: number; name: string; city: string; rating: number; comment: string; date: string; product: string; verified: boolean }[]>([]);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`/api/products/${slug}`);
        const p: IProduct = data.data?.product;
        setProduct(p);

        // Init variants
        if (p.variants?.length > 0) {
          const defaults: Record<string, string> = {};
          p.variants.forEach((v) => {
            if (v.options?.[0]) defaults[v.name] = v.options[0].value;
          });
          setSelectedVariants(defaults);
        }

        // Fetch related
        const rel = await axios.get('/api/products', {
          params: { category: p.category, limit: 4, exclude: p._id },
        });
        setRelated(rel.data.data?.products ?? []);
      } catch {
        router.push('/products');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug, router]);

  const handleAddToCart = async () => {
    if (!product) return;
    setAdding(true);
    addItem(product, quantity, selectedVariants);
    toast.success('تم الإضافة إلى السلة! 🛍️');
    openCart();
    setAdding(false);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addItem(product, quantity, selectedVariants);
    router.push('/checkout');
  };

  useEffect(() => {
    fetch('/api/content')
      .then((r) => r.json())
      .then((data) => setNavCategories(data.data?.nav_categories ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (activeTab !== 'reviews') return;
    fetch('/api/content')
      .then((r) => r.json())
      .then((data) => setReviews(data.data?.reviews ?? []))
      .catch(() => {});
  }, [activeTab]);

  const discountPercent = product?.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-page pt-20">
          <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="bg-surface aspect-square rounded-sm" />
              <div className="space-y-4">
                <div className="bg-surface h-8 rounded w-3/4" />
                <div className="bg-surface h-6 rounded w-1/4" />
                <div className="bg-surface h-32 rounded" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!product) return null;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-page pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-[var(--text-faint)] mb-8" dir="rtl">
            <Link href="/" className="hover:text-[#E91E8C] transition-colors">الرئيسية</Link>
            <ChevronLeft size={14} />
            <Link href="/products" className="hover:text-[#E91E8C] transition-colors">المنتجات</Link>
            <ChevronLeft size={14} />
            <Link
              href={`/products?category=${product.category}`}
              className="hover:text-[#E91E8C] transition-colors"
            >
              {getCategoryLabel(product.category, navCategories)}
            </Link>
            <ChevronLeft size={14} />
            <span className="text-[var(--text)] truncate max-w-[200px]">{product.nameAr}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Images */}
            <div>
              <div className="relative aspect-square bg-surface-alt border border-theme-border rounded-sm overflow-hidden mb-3">
                {product.images[selectedImage] && (
                  <Image
                    src={product.images[selectedImage]}
                    alt={product.nameAr}
                    fill
                    className="object-cover"
                    priority
                  />
                )}
                {discountPercent > 0 && (
                  <div className="absolute top-4 right-4 bg-red-500 text-[var(--text)] text-sm font-bold px-3 py-1 rounded-sm">
                    -{discountPercent}%
                  </div>
                )}
                {product.stock < 5 && product.stock > 0 && (
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute top-4 left-4 bg-orange-500 text-[var(--text)] text-xs font-bold px-3 py-1 rounded-sm"
                  >
                    باقي {product.stock} فقط! 🔥
                  </motion.div>
                )}
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`relative w-16 h-16 flex-shrink-0 border-2 rounded-sm overflow-hidden transition-colors ${
                        i === selectedImage ? 'border-[#E91E8C]' : 'border-theme-border'
                      }`}
                    >
                      <Image src={img} alt={`${product.nameAr} ${i + 1}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product info */}
            <div dir="rtl">
              <div className="mb-2">
                <span className="text-xs uppercase tracking-widest text-[#E91E8C]">
                  {getCategoryLabel(product.category, navCategories)}
                </span>
              </div>

              <h1 className="font-display text-3xl text-[var(--text)] mb-2">{product.nameAr}</h1>
              <p className="text-[var(--text-faint)] text-sm mb-4">{product.name}</p>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex text-[#E91E8C]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" />
                  ))}
                </div>
                <span className="text-sm text-[var(--text-faint)]">(4.9) · {product.sold}+ مبيعة</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl font-bold text-[#E91E8C]">{product.price} جنيه</span>
                {product.comparePrice && (
                  <span className="text-lg text-[var(--text-faint)] line-through">{product.comparePrice} جنيه</span>
                )}
              </div>

              {/* Stock */}
              {product.stock === 0 ? (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-sm text-sm mb-6">
                  نفد المخزون
                </div>
              ) : product.stock < 10 ? (
                <div className="bg-orange-500/10 border border-orange-500/30 text-orange-400 px-4 py-2 rounded-sm text-sm mb-6">
                  ⚡ باقي {product.stock} قطعة فقط في المخزون!
                </div>
              ) : (
                <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-2 rounded-sm text-sm mb-6">
                  ✅ متوفر في المخزون
                </div>
              )}

              {/* Variants */}
              {product.variants?.map((variant) => (
                <div key={variant.name} className="mb-4">
                  <label className="label">
                    {variant.nameAr}: <span className="text-[var(--text)]">{selectedVariants[variant.name]}</span>
                  </label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {variant.options.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() =>
                          setSelectedVariants((prev) => ({ ...prev, [variant.name]: opt.value }))
                        }
                        disabled={opt.stock === 0}
                        className={`px-4 py-2 text-sm border rounded-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                          selectedVariants[variant.name] === opt.value
                            ? 'bg-[#E91E8C] text-#ffffff border-[#E91E8C]'
                            : 'border-theme-border text-[var(--text-muted)] hover:border-[#E91E8C]'
                        }`}
                      >
                        {opt.value}
                        {opt.priceModifier !== 0 && (
                          <span className="text-xs ml-1">
                            ({opt.priceModifier > 0 ? '+' : ''}{opt.priceModifier})
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Quantity */}
              <div className="mb-6">
                <label className="label">الكمية</label>
                <div className="flex items-center gap-3 mt-2">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-10 h-10 border border-theme-border rounded-sm flex items-center justify-center hover:border-[#E91E8C] transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="text-[var(--text)] font-bold text-lg w-8 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock}
                    className="w-10 h-10 border border-theme-border rounded-sm flex items-center justify-center hover:border-[#E91E8C] transition-colors disabled:opacity-30"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* CTA buttons */}
              <div className="flex flex-col gap-3 mb-8">
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="btn-primary flex items-center justify-center gap-2 text-base py-4 disabled:opacity-50"
                >
                  <Zap size={18} />
                  اشتري الآن — الدفع عند الاستلام
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || adding}
                  className="btn-secondary flex items-center justify-center gap-2 text-base py-4 disabled:opacity-50"
                >
                  <ShoppingBag size={18} />
                  {adding ? 'جاري الإضافة...' : 'أضف للسلة'}
                </button>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-3 border-t border-theme-border pt-6">
                <div className="text-center">
                  <Shield className="text-[#E91E8C] mx-auto mb-1" size={20} />
                  <p className="text-xs text-[var(--text-faint)]">دفع آمن</p>
                </div>
                <div className="text-center">
                  <Truck className="text-[#E91E8C] mx-auto mb-1" size={20} />
                  <p className="text-xs text-[var(--text-faint)]">شحن لكل مصر</p>
                </div>
                <div className="text-center">
                  <RefreshCw className="text-[#E91E8C] mx-auto mb-1" size={20} />
                  <p className="text-xs text-[var(--text-faint)]">ضمان الجودة</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-16 border-t border-theme-border pt-8">
            <div className="flex gap-6 border-b border-theme-border mb-6">
              {(['description', 'reviews'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'border-[#E91E8C] text-[#E91E8C]'
                      : 'border-transparent text-[var(--text-faint)] hover:text-[var(--text)]'
                  }`}
                >
                  {tab === 'description' ? 'الوصف' : 'التقييمات'}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'description' && (
                <motion.div
                  key="description"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-[var(--text-muted)] leading-relaxed max-w-2xl"
                  dir="rtl"
                >
                  <p className="whitespace-pre-line">{product.descriptionAr}</p>
                </motion.div>
              )}
              {activeTab === 'reviews' && (
                <motion.div
                  key="reviews"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  dir="rtl"
                >
                  {reviews.length === 0 ? (
                    <p className="text-[var(--text-faint)] text-sm">لا توجد تقييمات بعد.</p>
                  ) : (
                    <div className="space-y-5">
                      {reviews.map((r) => (
                        <div key={r.id} className="border-b border-theme-border pb-5">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-[var(--text)] text-sm">{r.name}</span>
                              {r.verified && (
                                <span className="text-[10px] bg-green-500/15 text-green-500 px-2 py-0.5 rounded-full font-medium">
                                  ✓ مشتري موثق
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-[var(--text-faint)]">{r.city} · {r.date}</span>
                          </div>
                          <div className="flex text-[#E91E8C] mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={13} fill={i < r.rating ? 'currentColor' : 'none'} />
                            ))}
                          </div>
                          <p className="text-[var(--text-muted)] text-sm leading-relaxed">{r.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Related products */}
          {related.length > 0 && (
            <div className="mt-16">
              <h2 className="font-display text-2xl text-[var(--text)] mb-6" dir="rtl">منتجات مشابهة</h2>
              <ProductGrid products={related} columns={4} />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
