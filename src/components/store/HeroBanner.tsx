'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=1920&q=80',
    tag: 'New Collection',
    tagAr: 'مجموعة جديدة',
    headingLine1: 'Wear What',
    headingLine2: 'Moves You',
    sub: 'Accessories for the modern Egyptian woman',
    subAr: 'إكسسوارات للمرأة المصرية العصرية',
  },
  {
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1920&q=80',
    tag: 'Necklaces',
    tagAr: 'قلادات',
    headingLine1: 'Effortless',
    headingLine2: 'Elegance',
    sub: 'Statement pieces for every occasion',
    subAr: 'قطع مميزة لكل مناسبة',
  },
  {
    image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=1920&q=80',
    tag: 'Bracelets',
    tagAr: 'أساور',
    headingLine1: 'Golden',
    headingLine2: 'Moments',
    sub: 'Stack, layer, and express yourself',
    subAr: 'صففي، طبقي، وعبّري عن نفسك',
  },
];

export default function HeroBanner() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, []);

  const slide = slides[idx];

  return (
    <section className="relative w-full h-[90vh] min-h-[560px] max-h-[900px] overflow-hidden mt-[104px] md:mt-[128px]">
      {/* Background images */}
      {slides.map((s, i) => (
        <motion.div
          key={s.image}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${s.image})` }}
          animate={{ opacity: i === idx ? 1 : 0 }}
          transition={{ duration: 1.4 }}
        />
      ))}

      {/* Light editorial overlay — left to right fade, Accessorize style */}
      <div className="absolute inset-0 hero-gradient" />

      {/* Content — left-aligned editorial */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 w-full">
          <div className="max-w-lg">
            {/* Tag */}
            <AnimatePresence mode="wait">
              <motion.p
                key={`tag-${idx}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="section-tag mb-5"
              >
                {slide.tag} · {slide.tagAr}
              </motion.p>
            </AnimatePresence>

            {/* Heading */}
            <AnimatePresence mode="wait">
              <motion.h1
                key={`h-${idx}`}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.6 }}
                className="font-display text-5xl sm:text-6xl md:text-7xl font-black leading-[1.0] mb-6"
                style={{ color: 'var(--text)' }}
              >
                {slide.headingLine1}
                <br />
                <em className="not-italic" style={{ color: 'var(--text)' }}>{slide.headingLine2}</em>
              </motion.h1>
            </AnimatePresence>

            {/* Subtitle */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`sub-${idx}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
              >
                <p className="text-sm tracking-wide mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  {slide.sub}
                </p>
                <p className="font-arabic text-sm" style={{ color: 'var(--text-faint)' }}>
                  {slide.subAr}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex items-center gap-4 mt-10"
            >
              <Link
                href="/products"
                className="btn-primary"
              >
                Shop Now
                <ArrowRight size={14} strokeWidth={1.5} />
              </Link>
              <Link
                href="/products?sort=sale"
                className="btn-secondary"
              >
                تسوق الآن
              </Link>
            </motion.div>

            {/* Trust micro-bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex items-center gap-5 mt-10"
            >
              {['دفع عند الاستلام', 'شحن لكل مصر', 'ضمان الجودة'].map((item) => (
                <span
                  key={item}
                  className="flex items-center gap-1.5 text-[11px] font-arabic"
                  style={{ color: 'var(--text-faint)' }}
                >
                  <span className="w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--pink)' }} />
                  {item}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Slide dots */}
      <div className="absolute bottom-8 left-6 sm:left-10 lg:left-16 flex gap-2 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className="transition-all duration-300 rounded-full"
            style={{
              width: i === idx ? 24 : 6,
              height: 6,
              backgroundColor: i === idx ? 'var(--text)' : 'var(--border-strong)',
            }}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
