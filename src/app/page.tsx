import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import Navbar from '@/components/store/Navbar';
import Footer from '@/components/store/Footer';
import HeroBanner from '@/components/store/HeroBanner';
import TrustBadges from '@/components/store/TrustBadges';
import ReviewsSection from '@/components/store/ReviewsSection';
import ProductCard from '@/components/store/ProductCard';
import { IProduct } from '@/types';
import { ArrowRight } from 'lucide-react';
import NewsletterForm from '@/components/store/NewsletterForm';

export const metadata: Metadata = {
  title: 'Luxe Accessories | إكسسوارات لوكس — Premium Egyptian Fashion',
  description: 'Shop luxury Egyptian accessories. Bracelets, necklaces, rings, and sunglasses. Cash on delivery across all governorates.',
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

const categories = [
  {
    slug: 'bracelets',
    en: 'Bracelets',
    ar: 'أساور',
    image: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=800&q=80',
  },
  {
    slug: 'necklaces',
    en: 'Necklaces',
    ar: 'قلادات',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80',
  },
  {
    slug: 'rings',
    en: 'Rings',
    ar: 'خواتم',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80',
  },
  {
    slug: 'sunglasses',
    en: 'Sunglasses',
    ar: 'نظارات',
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80',
  },
];

async function getFeaturedProducts(): Promise<IProduct[]> {
  try {
    const res = await fetch(`${API_BASE}/products?featured=true&limit=8`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return getMockProducts();
    const data = await res.json();
    return data.data || getMockProducts();
  } catch {
    return getMockProducts();
  }
}

function getMockProducts(): IProduct[] {
  const cats = ['bracelets', 'necklaces', 'rings', 'sunglasses'] as const;
  const names = ['Gold Chain Bracelet', 'Pearl Drop Necklace', 'Statement Ring', 'Vintage Sunglasses',
                 'Rose Gold Bangle', 'Crystal Pendant', 'Stacking Rings Set', 'Cat Eye Shades'];
  const namesAr = ['أسورة سلسلة ذهبية', 'قلادة لؤلؤة', 'خاتم مميز', 'نظارات كلاسيكية',
                   'أسورة ذهب وردي', 'قلادة كريستال', 'طقم خواتم', 'نظارات كاتس آي'];
  const imgs = [
    'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600&q=80',
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80',
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80',
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80',
    'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=80',
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80',
    'https://images.unsplash.com/photo-1598560917505-59a3ad559071?w=600&q=80',
    'https://images.unsplash.com/photo-1577803645773-f96470509666?w=600&q=80',
  ];

  return Array.from({ length: 8 }, (_, i) => ({
    _id: `mock-${i}`,
    name: names[i],
    nameAr: namesAr[i],
    slug: `product-${i + 1}`,
    description: 'Premium luxury accessory crafted with finest materials.',
    descriptionAr: 'إكسسوار فاخر مصنوع من أجود المواد.',
    price: [299, 450, 199, 350, 280, 520, 389, 310][i],
    comparePrice: [399, 600, 250, 450, 350, 680, 500, 420][i],
    images: [imgs[i]],
    category: cats[i % 4],
    variants: [],
    stock: [12, 3, 8, 2, 15, 6, 4, 9][i],
    sold: [120, 85, 34, 67, 23, 91, 55, 40][i],
    isActive: true,
    isFeatured: true,
    tags: ['luxury', 'featured'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
}

export default async function HomePage() {
  const featured = await getFeaturedProducts();

  return (
    <div style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
      <Navbar />

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <HeroBanner />

      {/* ── Trust strip ─────────────────────────────────────────────── */}
      <TrustBadges />

      {/* ── Shop by Category ────────────────────────────────────────── */}
      <section className="py-24" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="section-tag mb-3">Shop by Category</p>
              <h2 className="section-title">Our Collections</h2>
            </div>
            <Link
              href="/products"
              className="hidden sm:flex items-center gap-2 text-[11px] tracking-[0.18em] uppercase underline-hover transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              View All <ArrowRight size={13} strokeWidth={1.5} />
            </Link>
          </div>

          {/* Category grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="group relative overflow-hidden block"
                style={{ aspectRatio: '3/4' }}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url(${cat.image})` }}
                />
                {/* Subtle bottom gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-white font-display text-xl font-normal italic mb-0.5">
                    {cat.en}
                  </h3>
                  <p className="font-arabic text-white/70 text-sm mb-3">{cat.ar}</p>
                  <span className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.2em] uppercase text-white/60 group-hover:text-white transition-colors group-hover:gap-2">
                    Shop <ArrowRight size={11} strokeWidth={1.5} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Best Sellers ─────────────────────────────────────────────── */}
      <section className="py-24" style={{ backgroundColor: 'var(--bg-alt)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="section-tag mb-3">Best Sellers</p>
              <h2 className="section-title">Most Loved Pieces</h2>
            </div>
            <Link
              href="/products?sort=popular"
              className="hidden sm:flex items-center gap-2 text-[11px] tracking-[0.18em] uppercase underline-hover"
              style={{ color: 'var(--text-muted)' }}
            >
              View All <ArrowRight size={13} strokeWidth={1.5} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featured.map((product, i) => (
              <ProductCard key={product._id} product={product} index={i} />
            ))}
          </div>

          <div className="mt-10 text-center sm:hidden">
            <Link href="/products?sort=popular" className="btn-secondary">
              View All
            </Link>
          </div>
        </div>
      </section>

      {/* ── Editorial / Why Us ───────────────────────────────────────── */}
      <section className="py-24" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Text side */}
            <div>
              <p className="section-tag mb-4">Our Promise</p>
              <h2 className="section-title mb-6">
                Crafted for the<br />Modern Egyptian Woman
              </h2>
              <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-muted)' }}>
                Every piece in our collection is chosen for its quality, craftsmanship, and ability to elevate your everyday look — from the boardroom to a Cairo evening out.
              </p>
              <p className="font-arabic text-sm leading-relaxed mb-8" style={{ color: 'var(--text-faint)' }}>
                كل قطعة في مجموعتنا مختارة بعناية للجودة والأناقة — من المكتب لسهرة القاهرة.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { en: 'Cash on Delivery', ar: 'دفع عند الاستلام' },
                  { en: 'Ships Nationwide', ar: 'شحن لكل مصر' },
                  { en: 'Quality Guarantee', ar: 'ضمان الجودة' },
                  { en: '7-Day Returns', ar: 'إرجاع ٧ أيام' },
                ].map((item) => (
                  <div key={item.en} className="flex items-start gap-2">
                    <span className="mt-1 w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: 'var(--pink)' }} />
                    <div>
                      <p className="text-xs font-medium" style={{ color: 'var(--text)' }}>{item.en}</p>
                      <p className="font-arabic text-xs" style={{ color: 'var(--text-faint)' }}>{item.ar}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link href="/products" className="btn-primary">
                Shop Now <ArrowRight size={14} strokeWidth={1.5} />
              </Link>
            </div>

            {/* Image side */}
            <div className="relative aspect-[4/5] overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=80)` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Reviews ──────────────────────────────────────────────────── */}
      <ReviewsSection />

      {/* ── COD Banner ───────────────────────────────────────────────── */}
      <section
        className="py-20 border-y"
        style={{ backgroundColor: 'var(--surface-alt)', borderColor: 'var(--border-strong)' }}
      >
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="section-tag mb-5">Free Delivery</p>
          <h2 className="section-title mb-4">
            الدفع عند الاستلام<br />لجميع المحافظات
          </h2>
          <p className="text-sm leading-relaxed mb-2 max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
            Order with complete confidence — pay cash when your parcel arrives at your door, anywhere in Egypt.
          </p>
          <p className="font-arabic text-sm mb-10" style={{ color: 'var(--text-faint)' }}>
            اطلبي بكل أمان وادفعي لما البضاعة توصلك — لجميع محافظات مصر
          </p>
          <Link href="/products" className="btn-primary">
            Shop The Collection <ArrowRight size={14} strokeWidth={1.5} />
          </Link>
        </div>
      </section>

      {/* ── Newsletter ───────────────────────────────────────────────── */}
      <section className="py-20" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="max-w-md mx-auto px-4 text-center">
          <p className="section-tag mb-4">Stay in the loop</p>
          <h3 className="font-display text-3xl font-black italic mb-3" style={{ color: 'var(--text)' }}>
            New arrivals, first.
          </h3>
          <p className="font-arabic text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
            اشتركي وكوني أول من يعرف بالعروض والمنتجات الجديدة
          </p>
          <NewsletterForm />
          <p className="text-xs mt-3 font-arabic" style={{ color: 'var(--text-faint)' }}>
            لا سبام — نوصلك بس بأهم الأخبار
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
