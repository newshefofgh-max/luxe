'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

interface Review {
  id: number;
  name: string;
  city: string;
  rating: number;
  comment: string;
  date: string;
  product?: string;
  verified: boolean;
}

const reviews: Review[] = [
  {
    id: 1,
    name: 'منى إبراهيم',
    city: 'القاهرة',
    rating: 5,
    comment: 'والله البضاعة روعة! الأسورة وصلت في كيس فاخر جداً والشغل محكم. أحسن من اللي توقعته بكتير. هطلب تاني قريب.',
    date: '٥ أبريل ٢٠٢٤',
    product: 'Gold Chain Bracelet',
    verified: true,
  },
  {
    id: 2,
    name: 'سارة محمد',
    city: 'الإسكندرية',
    rating: 5,
    comment: 'القلادة تحفة فعلاً، اتهدت لي من أختي وانبهرت باللي شوفته. الذهب اللون ثابت ومش بيتأثر بالمياه.',
    date: '١٢ مارس ٢٠٢٤',
    product: 'Pearl Drop Necklace',
    verified: true,
  },
  {
    id: 3,
    name: 'دينا علي',
    city: 'الجيزة',
    rating: 5,
    comment: 'خير ما شوفت متجر سريع في التوصيل وأمين! طلبت الخاتم يوم الاتنين ووصل الأربعاء. والباقي التغليف كان هدية جاهزة.',
    date: '٢٠ فبراير ٢٠٢٤',
    product: 'Statement Ring',
    verified: true,
  },
  {
    id: 4,
    name: 'ريم عبد الله',
    city: 'المنصورة',
    rating: 5,
    comment: 'النظارات الشمسية أنيقة جداً ومريحة على الوجه. السعر معقول جداً على الجودة دي. كل صاحباتي اتسألوا عنها!',
    date: '٨ يناير ٢٠٢٤',
    product: 'Vintage Sunglasses',
    verified: true,
  },
  {
    id: 5,
    name: 'نور حسن',
    city: 'أسيوط',
    rating: 5,
    comment: 'أول مرة أشتري اونلاين وكنت خايفة، بس الحمد لله التجربة كانت ممتازة. دفعت عند الاستلام وما فيش مشكلة.',
    date: '٢٥ ديسمبر ٢٠٢٣',
    product: 'Gold Bangle Set',
    verified: true,
  },
  {
    id: 6,
    name: 'مريم خالد',
    city: 'طنطا',
    rating: 4,
    comment: 'إكسسوارات جميلة ومميزة. التوصيل وصل في الموعد وخدمة العملاء كانت متعاونة جداً لما اتصلت. أنصح بيه بجد.',
    date: '١٤ نوفمبر ٢٠٢٣',
    product: 'Silver Choker',
    verified: true,
  },
];

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={12}
          strokeWidth={1}
          style={{
            color: 'var(--pink)',
            fill: s <= n ? 'var(--pink)' : 'transparent',
          }}
        />
      ))}
    </div>
  );
}

const PER_PAGE = 3;

export default function ReviewsSection() {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(reviews.length / PER_PAGE);
  const visible    = reviews.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);
  const avg        = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <section className="py-24" style={{ backgroundColor: 'var(--bg-alt)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <p className="section-tag mb-4">Customer Reviews</p>
          <h2 className="section-title mb-8">What Our Customers Say</h2>

          {/* Average */}
          <div className="inline-flex flex-col items-center gap-2">
            <span
              className="font-display text-5xl font-black italic"
              style={{ color: 'var(--text)' }}
            >
              {avg}
            </span>
            <Stars n={5} />
            <p className="text-xs tracking-wider uppercase" style={{ color: 'var(--text-faint)' }}>
              {reviews.length} verified reviews
            </p>
          </div>
        </div>

        {/* Cards */}
        <div className="relative min-h-[260px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {visible.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="p-7 border flex flex-col gap-4"
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border-strong)',
                  }}
                >
                  <Stars n={r.rating} />

                  <p
                    className="font-arabic text-sm leading-relaxed flex-1"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {r.comment}
                  </p>

                  <div
                    className="pt-4 border-t flex items-end justify-between"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <div>
                      <p className="font-arabic text-sm font-medium" style={{ color: 'var(--text)' }}>
                        {r.name}
                      </p>
                      <p className="font-arabic text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>
                        {r.city}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px]" style={{ color: 'var(--text-faint)' }}>{r.date}</p>
                      {r.verified && (
                        <p
                          className="text-[10px] mt-0.5"
                          style={{ color: 'var(--pink)' }}
                        >
                          ✓ Verified
                        </p>
                      )}
                    </div>
                  </div>

                  {r.product && (
                    <p
                      className="text-[10px] tracking-wide uppercase"
                      style={{ color: 'var(--text-faint)' }}
                    >
                      {r.product}
                    </p>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="w-10 h-10 border flex items-center justify-center transition-colors disabled:opacity-30"
              style={{ borderColor: 'var(--border-strong)', color: 'var(--text-muted)' }}
            >
              <ChevronLeft size={16} strokeWidth={1.5} />
            </button>
            <div className="flex gap-1.5">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className="h-1 rounded-full transition-all"
                  style={{
                    width: i === page ? 24 : 6,
                    backgroundColor: i === page ? 'var(--text)' : 'var(--border-strong)',
                  }}
                />
              ))}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="w-10 h-10 border flex items-center justify-center transition-colors disabled:opacity-30"
              style={{ borderColor: 'var(--border-strong)', color: 'var(--text-muted)' }}
            >
              <ChevronRight size={16} strokeWidth={1.5} />
            </button>
          </div>
        )}

        <p
          className="text-center font-arabic text-sm mt-10"
          style={{ color: 'var(--text-faint)' }}
        >
          انضم لآلاف العميلات الراضيات — اطلبي الآن وادفعي عند الاستلام
        </p>
      </div>
    </section>
  );
}
