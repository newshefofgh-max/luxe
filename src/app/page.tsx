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
import { DEFAULT_CONTENT } from '@/lib/defaultContent';

export const metadata: Metadata = {
  title: 'Accessory | إكسسوارات — Premium Egyptian Fashion',
  description: 'Shop luxury Egyptian accessories. Bracelets, necklaces, rings, and sunglasses. Cash on delivery across all governorates.',
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

async function getSiteContent(): Promise<Record<string, unknown>> {
  try {
    const res = await fetch(`${API_BASE}/content`, { next: { revalidate: 60 } });
    if (!res.ok) return DEFAULT_CONTENT;
    const { data } = await res.json();
    return data ?? DEFAULT_CONTENT;
  } catch {
    return DEFAULT_CONTENT;
  }
}

async function getFeaturedProducts(): Promise<IProduct[]> {
  try {
    const res = await fetch(`${API_BASE}/products?featured=true&limit=8`, { next: { revalidate: 300 } });
    if (!res.ok) return getMockProducts();
    const data = await res.json();
    return data.data?.length ? data.data : getMockProducts();
  } catch {
    return getMockProducts();
  }
}

async function getNewProducts(): Promise<IProduct[]> {
  try {
    const res = await fetch(`${API_BASE}/products?sort=newest&limit=8`, { next: { revalidate: 120 } });
    if (!res.ok) return getMockProducts();
    const data = await res.json();
    return data.data?.length ? data.data : getMockProducts();
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
    name: names[i], nameAr: namesAr[i],
    slug: `product-${i + 1}`,
    description: 'Premium luxury accessory crafted with finest materials.',
    descriptionAr: 'إكسسوار فاخر مصنوع من أجود المواد.',
    price: [299, 450, 199, 350, 280, 520, 389, 310][i],
    comparePrice: [399, 600, 250, 450, 350, 680, 500, 420][i],
    images: [imgs[i]],
    category: cats[i % 4],
    variants: [], stock: [12, 3, 8, 2, 15, 6, 4, 9][i],
    sold: [120, 85, 34, 67, 23, 91, 55, 40][i],
    isActive: true, isFeatured: true, tags: ['luxury', 'featured'],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  }));
}

type CatItem = { slug: string; en: string; ar: string; image: string };
type CatSection = { tag_en?: string; tag_ar?: string; title_en?: string; title_ar?: string; items?: CatItem[] };
type CodBanner = { tag_en?: string; tag_ar?: string; heading_ar?: string; text_en?: string; text_ar?: string; cta_en?: string };
type FeaturedSection = { tag_en?: string; title_en?: string };

export default async function HomePage() {
  const [content, featured, newProducts] = await Promise.all([
    getSiteContent(),
    getFeaturedProducts(),
    getNewProducts(),
  ]);

  const announcement = content.announcement_bar as Record<string, unknown> | undefined;
  const heroSlides   = content.hero_slides as unknown[] | undefined;
  const navCats      = content.nav_categories as unknown[] | undefined;
  const trustBadges  = content.trust_badges as unknown[] | undefined;
  const catSection   = (content.categories_section ?? {}) as CatSection;
  const featSection  = (content.featured_section ?? {}) as FeaturedSection;
  const codBanner    = (content.cod_banner ?? {}) as CodBanner;
  const footerData   = content.footer as Record<string, unknown> | undefined;
  const reviews      = content.reviews as unknown[] | undefined;

  const catItems: CatItem[] = catSection.items ?? [
    { slug: 'bracelets', en: 'Bracelets', ar: 'أساور', image: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=800&q=80' },
    { slug: 'necklaces', en: 'Necklaces', ar: 'قلادات', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80' },
    { slug: 'rings',     en: 'Rings',     ar: 'خواتم',  image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80' },
    { slug: 'sunglasses',en: 'Sunglasses',ar: 'نظارات', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80' },
  ];

  return (
    <div style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
      <Navbar
        announcementContent={announcement as Parameters<typeof Navbar>[0]['announcementContent']}
      />

      {/* ── Hero ── */}
      <HeroBanner slides={heroSlides as Parameters<typeof HeroBanner>[0]['slides']} />

      {/* ── Trust strip ── */}
      <TrustBadges badges={trustBadges as Parameters<typeof TrustBadges>[0]['badges']} />

      {/* ── New Arrivals ── */}
      <section className="py-24" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="section-tag mb-3">New In</p>
              <h2 className="section-title">Latest Arrivals</h2>
            </div>
          </div>

          {/* Product grid with gradient fade */}
          <div className="relative">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {newProducts.map((product, i) => (
                <ProductCard key={product._id} product={product} index={i} />
              ))}
            </div>

            {/* Gradient fade over the last row */}
            <div
              className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none"
              style={{
                background: 'linear-gradient(to bottom, transparent 0%, var(--bg) 100%)',
              }}
            />
          </div>

          {/* View All button */}
          <div className="mt-2 text-center">
            <Link
              href="/products?sort=newest"
              className="btn-primary inline-flex items-center gap-2"
            >
              View All Products <ArrowRight size={14} strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Shop by Category ── */}
      <section className="py-24" style={{ backgroundColor: 'var(--bg-alt)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="section-tag mb-3">{catSection.tag_en ?? 'Shop by Category'}</p>
              <h2 className="section-title">{catSection.title_en ?? 'Our Collections'}</h2>
            </div>
            <Link
              href="/products"
              className="hidden sm:flex items-center gap-2 text-[11px] tracking-[0.18em] uppercase underline-hover transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              View All <ArrowRight size={13} strokeWidth={1.5} />
            </Link>
          </div>

          {/* 4-col category grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {catItems.map((cat) => (
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-white font-display text-xl font-normal italic mb-0.5">{cat.en}</h3>
                  <p className="font-arabic text-white/70 text-sm mb-3">{cat.ar}</p>
                  <span className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.2em] uppercase text-white/60 group-hover:text-white transition-colors group-hover:gap-2.5">
                    Shop <ArrowRight size={11} strokeWidth={1.5} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Best Sellers ── */}
      <section className="py-24" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="section-tag mb-3">{featSection.tag_en ?? 'Best Sellers'}</p>
              <h2 className="section-title">{featSection.title_en ?? 'Most Loved Pieces'}</h2>
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
            <Link href="/products?sort=popular" className="btn-secondary">View All</Link>
          </div>
        </div>
      </section>

      {/* ── Reviews ── */}
      <ReviewsSection reviews={reviews as Parameters<typeof ReviewsSection>[0]['reviews']} />

      {/* ── COD Banner ── */}
      <section
        className="py-20 border-y"
        style={{ backgroundColor: 'var(--surface-alt)', borderColor: 'var(--border-strong)' }}
      >
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="section-tag mb-5">{codBanner.tag_en ?? 'Free Delivery'}</p>
          <h2 className="section-title mb-4" style={{ whiteSpace: 'pre-line' }}>
            {codBanner.heading_ar ?? 'الدفع عند الاستلام\nلجميع المحافظات'}
          </h2>
          <p className="text-sm leading-relaxed mb-2 max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
            {codBanner.text_en ?? 'Order with complete confidence — pay cash when your parcel arrives at your door, anywhere in Egypt.'}
          </p>
          <p className="font-arabic text-sm mb-10" style={{ color: 'var(--text-faint)' }}>
            {codBanner.text_ar ?? 'اطلبي بكل أمان وادفعي لما البضاعة توصلك — لجميع محافظات مصر'}
          </p>
          <Link href="/products" className="btn-primary">
            {codBanner.cta_en ?? 'Shop The Collection'} <ArrowRight size={14} strokeWidth={1.5} />
          </Link>
        </div>
      </section>

      <Footer content={footerData as Parameters<typeof Footer>[0]['content']} />
    </div>
  );
}
