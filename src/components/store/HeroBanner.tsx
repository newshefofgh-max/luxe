'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface HeroSlide {
  image: string;
  tag_en: string;
  tag_ar: string;
  heading1: string;
  heading2: string;
  sub_en: string;
  sub_ar: string;
  cta_en: string;
  cta_ar: string;
  cta_href: string;
}

interface HeroBannerProps {
  slides?: HeroSlide[];
  lang?: 'en' | 'ar';
}

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    image: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=1920&q=80',
    tag_en: 'New Collection', tag_ar: 'مجموعة جديدة',
    heading1: 'Wear What', heading2: 'Moves You',
    sub_en: 'Accessories for the modern Egyptian woman',
    sub_ar: 'إكسسوارات للمرأة المصرية العصرية',
    cta_en: 'Shop Now', cta_ar: 'تسوق الآن', cta_href: '/products',
  },
  {
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1920&q=80',
    tag_en: 'Necklaces', tag_ar: 'قلادات',
    heading1: 'Effortless', heading2: 'Elegance',
    sub_en: 'Statement pieces for every occasion',
    sub_ar: 'قطع مميزة لكل مناسبة',
    cta_en: 'Shop Now', cta_ar: 'تسوق الآن', cta_href: '/products?category=necklaces',
  },
  {
    image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=1920&q=80',
    tag_en: 'Bracelets', tag_ar: 'أساور',
    heading1: 'Golden', heading2: 'Moments',
    sub_en: 'Stack, layer, and express yourself',
    sub_ar: 'صففي، طبقي، وعبّري عن نفسك',
    cta_en: 'Shop Now', cta_ar: 'تسوق الآن', cta_href: '/products?category=bracelets',
  },
];

export default function HeroBanner({ slides: slidesProp, lang = 'en' }: HeroBannerProps) {
  const slides = (slidesProp && slidesProp.length > 0) ? slidesProp : DEFAULT_SLIDES;
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, [slides.length]);

  const slide = slides[idx];

  return (
    <section className="relative w-full overflow-hidden" style={{ height: '88vh', minHeight: 520, maxHeight: 900 }}>
      {/* Background images */}
      {slides.map((s, i) => (
        <motion.div
          key={s.image}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${s.image})` }}
          animate={{ opacity: i === idx ? 1 : 0 }}
          transition={{ duration: 1.2 }}
        />
      ))}

      {/* Cream gradient overlay — Velvet style */}
      <div className="absolute inset-0 hero-gradient" />

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 w-full">
          <div className="max-w-xl">

            {/* Tag */}
            <AnimatePresence mode="wait">
              <motion.p
                key={`tag-${idx}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="section-tag mb-5"
              >
                {slide.tag_en} · <span className="font-arabic">{slide.tag_ar}</span>
              </motion.p>
            </AnimatePresence>

            {/* Heading */}
            <AnimatePresence mode="wait">
              <motion.h1
                key={`h-${idx}`}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.55 }}
                className="font-display text-5xl sm:text-6xl md:text-7xl font-black italic leading-[1.0] mb-6"
                style={{ color: 'var(--text)' }}
              >
                {slide.heading1}
                <br />
                <span style={{ color: 'var(--pink)' }}>{slide.heading2}</span>
              </motion.h1>
            </AnimatePresence>

            {/* Sub */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`sub-${idx}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, delay: 0.12 }}
              >
                <p className="text-sm tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>
                  {slide.sub_en}
                </p>
                <p className="font-arabic text-sm" style={{ color: 'var(--text-faint)' }}>
                  {slide.sub_ar}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="flex items-center gap-4 mt-10 flex-wrap"
            >
              <Link href={slide.cta_href} className="btn-primary">
                {slide.cta_en}
                <ArrowRight size={14} strokeWidth={1.5} />
              </Link>
              <Link href={slide.cta_href} className="btn-secondary font-arabic">
                {slide.cta_ar}
              </Link>
            </motion.div>

            {/* Trust micro-strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65 }}
              className="flex items-center gap-6 mt-10 flex-wrap"
            >
              {['دفع عند الاستلام', 'شحن لكل مصر', 'ضمان الجودة'].map((item) => (
                <span
                  key={item}
                  className="flex items-center gap-1.5 text-[11px] font-arabic"
                  style={{ color: 'var(--text-faint)' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--pink)' }} />
                  {item}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-8 left-6 sm:left-16 flex gap-2 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === idx ? 24 : 6,
              height: 6,
              backgroundColor: i === idx ? 'var(--pink)' : 'var(--border-strong)',
            }}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
