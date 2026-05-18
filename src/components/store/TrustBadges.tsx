'use client';

import React from 'react';
import { Truck, Shield, Phone, CreditCard } from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  CreditCard, Truck, Shield, Phone,
};

interface Badge { icon: string; en: string; ar: string; }

interface TrustBadgesProps {
  badges?: Badge[];
  lang?: 'en' | 'ar';
}

const DEFAULT_BADGES: Badge[] = [
  { icon: 'CreditCard', en: 'Cash on Delivery', ar: 'دفع عند الاستلام' },
  { icon: 'Truck',      en: 'Ships Nationwide', ar: 'شحن لكل مصر' },
  { icon: 'Shield',     en: 'Quality Guarantee', ar: 'ضمان الجودة' },
  { icon: 'Phone',      en: '7-Day Support',    ar: 'خدمة عملاء ٧ أيام' },
];

export default function TrustBadges({ badges = DEFAULT_BADGES, lang = 'en' }: TrustBadgesProps) {
  return (
    <section className="border-y" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border-strong)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {badges.map((b, i) => {
            const Icon = ICON_MAP[b.icon] ?? CreditCard;
            return (
              <div
                key={i}
                className="flex items-center gap-3 px-6 py-5 border-e last:border-e-0"
                style={{ borderColor: 'var(--border)' }}
              >
                <Icon size={18} strokeWidth={1.5} style={{ color: 'var(--pink)', flexShrink: 0 }} />
                <div>
                  <p className="text-[11px] tracking-[0.15em] uppercase font-medium" style={{ color: 'var(--text)' }}>
                    {lang === 'ar' ? b.ar : b.en}
                  </p>
                  <p className="font-arabic text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>
                    {b.ar}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
