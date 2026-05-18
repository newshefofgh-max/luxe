'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface LookItem {
  image: string;
  caption_en: string;
  caption_ar: string;
  href: string;
}

interface ShopOurLooksProps {
  content?: {
    visible?: boolean;
    tag_en?: string;
    tag_ar?: string;
    title_en?: string;
    title_ar?: string;
    items?: LookItem[];
  };
  lang?: 'en' | 'ar';
}

const DEFAULT_ITEMS: LookItem[] = [
  { image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80', caption_en: 'Everyday Gold', caption_ar: 'ذهب يومي', href: '/products?category=bracelets' },
  { image: 'https://images.unsplash.com/photo-1598560917505-59a3ad559071?w=600&q=80', caption_en: 'Layered Look', caption_ar: 'إطلالة متطبقة', href: '/products?category=necklaces' },
  { image: 'https://images.unsplash.com/photo-1577803645773-f96470509666?w=600&q=80', caption_en: 'Statement Ring', caption_ar: 'خاتم جريء', href: '/products?category=rings' },
  { image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80', caption_en: 'Sun-Ready', caption_ar: 'جاهزة للشمس', href: '/products?category=sunglasses' },
  { image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=80', caption_en: 'Stacked Bracelets', caption_ar: 'أساور متراكمة', href: '/products?category=bracelets' },
];

export default function ShopOurLooks({ content, lang = 'en' }: ShopOurLooksProps) {
  if (content?.visible === false) return null;

  const items      = content?.items ?? DEFAULT_ITEMS;
  const tag_en     = content?.tag_en   ?? 'Get The Look';
  const tag_ar     = content?.tag_ar   ?? 'احصلي على الإطلالة';
  const title_en   = content?.title_en ?? 'Shop Our Looks';
  const title_ar   = content?.title_ar ?? 'تسوقي إطلالاتنا';

  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' });
  };

  return (
    <section className="py-24 overflow-hidden" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="section-tag mb-3">{lang === 'ar' ? tag_ar : tag_en}</p>
            <h2 className="section-title">{lang === 'ar' ? title_ar : title_en}</h2>
          </div>
          {/* Nav arrows */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="w-10 h-10 border flex items-center justify-center transition-colors"
              style={{ borderColor: 'var(--border-strong)', color: 'var(--text-muted)' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--text)'; e.currentTarget.style.color = 'var(--text)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
              aria-label="Scroll left"
            >
              <ChevronLeft size={16} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-10 h-10 border flex items-center justify-center transition-colors"
              style={{ borderColor: 'var(--border-strong)', color: 'var(--text-muted)' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--text)'; e.currentTarget.style.color = 'var(--text)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
              aria-label="Scroll right"
            >
              <ChevronRight size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Horizontal scroll strip */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="flex-none"
              style={{ width: 240 }}
            >
              <Link href={item.href} className="group block">
                <div className="relative overflow-hidden mb-3" style={{ aspectRatio: '3/4', backgroundColor: 'var(--surface-alt)' }}>
                  <Image
                    src={item.image}
                    alt={item.caption_en}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="240px"
                  />
                  {/* Hover overlay */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 50%)' }}
                  >
                    <span className="text-[10px] tracking-[0.2em] uppercase font-medium text-white">
                      {lang === 'ar' ? 'تسوق الآن' : 'Shop Now'} →
                    </span>
                  </div>
                </div>
                <p className="text-[11px] tracking-[0.15em] uppercase font-medium" style={{ color: 'var(--text)' }}>
                  {lang === 'ar' ? item.caption_ar : item.caption_en}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
