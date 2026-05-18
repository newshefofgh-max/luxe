'use client';

import React from 'react';
import Link from 'next/link';
import { Instagram, Facebook, MessageCircle, Mail, Phone, MapPin } from 'lucide-react';

interface FooterLink { href: string; label: string; }
interface FooterContent {
  brand_desc_en?: string;
  brand_desc_ar?: string;
  whatsapp?: string;
  email?: string;
  location_en?: string;
  location_ar?: string;
  hours_ar?: string;
  instagram?: string;
  facebook?: string;
  shop_links?: FooterLink[];
  help_links?: FooterLink[];
}

interface FooterProps {
  content?: FooterContent;
  lang?: 'en' | 'ar';
}

const DEFAULT: FooterContent = {
  brand_desc_en: 'Premium accessories for the modern Egyptian woman.',
  brand_desc_ar: 'إكسسوارات فاخرة للمرأة المصرية العصرية.',
  whatsapp: '+201234567890',
  email: 'support@accessory.eg',
  location_en: 'Cairo, Egypt',
  location_ar: 'القاهرة، مصر',
  hours_ar: 'واتساب — السبت–الخميس ١٠ص–١٠م',
  instagram: 'https://instagram.com/accessory.eg',
  facebook: 'https://facebook.com/accessory.eg',
  shop_links: [
    { href: '/products?category=bracelets', label: 'Bracelets' },
    { href: '/products?category=necklaces', label: 'Necklaces' },
    { href: '/products?category=rings',     label: 'Rings' },
    { href: '/products?category=sunglasses',label: 'Sunglasses' },
    { href: '/products?sort=sale',          label: 'Sale' },
  ],
  help_links: [
    { href: '/account',  label: 'My Account' },
    { href: '/checkout', label: 'Checkout' },
    { href: '/returns',  label: 'Returns & Exchanges' },
    { href: '/shipping', label: 'Shipping Policy' },
    { href: '/privacy',  label: 'Privacy Policy' },
  ],
};

export default function Footer({ content = DEFAULT }: FooterProps) {
  const c    = { ...DEFAULT, ...content };
  const year = new Date().getFullYear();

  const socialLinks = [
    { href: c.instagram ?? '#', icon: Instagram,       label: 'Instagram' },
    { href: c.facebook  ?? '#', icon: Facebook,        label: 'Facebook' },
    { href: `https://wa.me/${(c.whatsapp ?? '').replace(/\D/g, '')}`, icon: MessageCircle, label: 'WhatsApp' },
  ];

  return (
    <footer style={{ backgroundColor: 'var(--bg-alt)', borderTop: '1px solid var(--border-strong)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-16">

          {/* Brand */}
          <div>
            <div className="mb-6">
              <span className="font-display text-2xl italic font-black" style={{ color: 'var(--text)' }}>Accessory</span>
              <span className="block text-[7px] tracking-[0.5em] uppercase mt-0.5" style={{ color: 'var(--pink)' }}>Accessories</span>
            </div>
            <p className="text-sm leading-relaxed mb-2" style={{ color: 'var(--text-muted)' }}>{c.brand_desc_en}</p>
            <p className="font-arabic text-sm leading-relaxed mb-6" style={{ color: 'var(--text-faint)' }}>{c.brand_desc_ar}</p>

            <div className="flex items-center gap-2">
              {socialLinks.map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 border flex items-center justify-center transition-colors"
                  style={{ borderColor: 'var(--border-strong)', color: 'var(--text-faint)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--pink)'; e.currentTarget.style.color = 'var(--pink)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-faint)'; }}
                >
                  <Icon size={15} strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-[10px] tracking-[0.25em] uppercase mb-5 font-medium" style={{ color: 'var(--text)' }}>Shop</h3>
            <ul className="space-y-3">
              {(c.shop_links ?? []).map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm underline-hover transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="text-[10px] tracking-[0.25em] uppercase mb-5 font-medium" style={{ color: 'var(--text)' }}>Help</h3>
            <ul className="space-y-3">
              {(c.help_links ?? []).map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm underline-hover transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-[10px] tracking-[0.25em] uppercase mb-5 font-medium" style={{ color: 'var(--text)' }}>Contact</h3>
            <ul className="space-y-4">
              {c.whatsapp && (
                <li>
                  <a
                    href={`https://wa.me/${c.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 text-sm transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                  >
                    <Phone size={14} strokeWidth={1.5} className="mt-0.5 shrink-0" style={{ color: 'var(--pink)' }} />
                    <div>
                      <span className="block">{c.whatsapp}</span>
                      {c.hours_ar && (
                        <span className="font-arabic text-xs mt-0.5 block" style={{ color: 'var(--text-faint)' }}>{c.hours_ar}</span>
                      )}
                    </div>
                  </a>
                </li>
              )}
              {c.email && (
                <li>
                  <a
                    href={`mailto:${c.email}`}
                    className="flex items-center gap-3 text-sm transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                  >
                    <Mail size={14} strokeWidth={1.5} className="shrink-0" style={{ color: 'var(--pink)' }} />
                    {c.email}
                  </a>
                </li>
              )}
              <li className="flex items-start gap-3 text-sm" style={{ color: 'var(--text-muted)' }}>
                <MapPin size={14} strokeWidth={1.5} className="mt-0.5 shrink-0" style={{ color: 'var(--pink)' }} />
                <div>
                  {c.location_en}
                  {c.location_ar && (
                    <span className="font-arabic block text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>{c.location_ar}</span>
                  )}
                </div>
              </li>
            </ul>

            {/* COD badge */}
            <div
              className="mt-6 inline-flex items-center gap-3 px-4 py-3 border"
              style={{ borderColor: 'var(--border-strong)', backgroundColor: 'var(--surface)' }}
            >
              <span className="text-lg">💛</span>
              <div>
                <p className="font-arabic text-xs font-semibold" style={{ color: 'var(--pink)' }}>نقدي عند الاستلام</p>
                <p className="text-[10px] tracking-wider uppercase" style={{ color: 'var(--text-faint)' }}>Cash on Delivery</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t py-5" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
            © {year} Accessory Egypt. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {(c.help_links ?? []).slice(2).map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-xs transition-colors"
                style={{ color: 'var(--text-faint)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-faint)')}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
