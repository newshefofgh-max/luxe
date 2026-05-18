'use client';

import React from 'react';

interface AnnouncementBarProps {
  content?: {
    visible?: boolean;
    items_en?: string[];
    items_ar?: string[];
    bg_color?: string;
    text_color?: string;
  };
  lang: 'en' | 'ar';
}

export default function AnnouncementBar({ content, lang }: AnnouncementBarProps) {
  if (!content?.visible) return null;

  const items = lang === 'ar'
    ? (content.items_ar ?? [])
    : (content.items_en ?? []);

  if (items.length === 0) return null;

  const doubled = [...items, ...items];

  return (
    <div
      className="w-full overflow-hidden"
      style={{
        backgroundColor: content.bg_color ?? '#1a1a18',
        color: content.text_color ?? '#FAF9F7',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div className="ticker-track flex items-center whitespace-nowrap" style={{ willChange: 'transform' }}>
        {doubled.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-6 px-8 text-[10px] tracking-[0.2em] uppercase font-medium"
          >
            {item}
            <span style={{ opacity: 0.35 }}>·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
