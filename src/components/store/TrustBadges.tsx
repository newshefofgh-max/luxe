'use client';

import React from 'react';
import { Truck, Shield, Phone, CreditCard } from 'lucide-react';

const badges = [
  {
    icon: CreditCard,
    en: 'Cash on Delivery',
    ar: 'دفع عند الاستلام',
  },
  {
    icon: Truck,
    en: 'Ships Nationwide',
    ar: 'شحن لكل مصر',
  },
  {
    icon: Shield,
    en: 'Quality Guarantee',
    ar: 'ضمان الجودة',
  },
  {
    icon: Phone,
    en: '7-Day Support',
    ar: 'خدمة عملاء ٧ أيام',
  },
];

export default function TrustBadges() {
  return (
    <section
      className="border-y"
      style={{ backgroundColor: 'var(--bg-alt)', borderColor: 'var(--border-strong)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0"
          style={{ '--tw-divide-opacity': 1 } as React.CSSProperties}
        >
          {badges.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.en}
                className="flex items-center gap-3 px-6 py-5 group"
                style={{ borderColor: 'var(--border)' }}
              >
                <Icon
                  size={18}
                  strokeWidth={1.5}
                  style={{ color: 'var(--pink)', flexShrink: 0 }}
                />
                <div>
                  <p
                    className="text-[11px] tracking-[0.15em] uppercase font-medium"
                    style={{ color: 'var(--text)' }}
                  >
                    {b.en}
                  </p>
                  <p
                    className="font-arabic text-xs mt-0.5"
                    style={{ color: 'var(--text-faint)' }}
                  >
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
