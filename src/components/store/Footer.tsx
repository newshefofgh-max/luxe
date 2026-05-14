'use client';

import React from 'react';
import Link from 'next/link';
import { Instagram, Facebook, MessageCircle, Mail, Phone, MapPin } from 'lucide-react';

const WHATSAPP = '+201234567890';
const EMAIL    = 'support@luxeaccessories.eg';

const shopLinks = [
  { href: '/products?category=bracelets', label: 'Bracelets' },
  { href: '/products?category=necklaces', label: 'Necklaces' },
  { href: '/products?category=rings',     label: 'Rings' },
  { href: '/products?category=sunglasses',label: 'Sunglasses' },
  { href: '/products?sort=sale',          label: 'Sale' },
];

const helpLinks = [
  { href: '/account',  label: 'My Account' },
  { href: '/checkout', label: 'Checkout' },
  { href: '/returns',  label: 'Returns & Exchanges' },
  { href: '/shipping', label: 'Shipping Policy' },
  { href: '/privacy',  label: 'Privacy Policy' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ backgroundColor: 'var(--bg-alt)', borderTop: '1px solid var(--border-strong)' }}>

      {/* Main columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-16">

          {/* Brand */}
          <div>
            <div className="mb-6">
              <span className="font-display text-2xl italic font-black" style={{ color: 'var(--text)' }}>
                Luxe
              </span>
              <span
                className="block text-[8px] tracking-[0.4em] uppercase mt-0.5"
                style={{ color: 'var(--text-faint)' }}
              >
                Accessories
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-2" style={{ color: 'var(--text-muted)' }}>
              Premium accessories for the modern Egyptian woman.
            </p>
            <p className="font-arabic text-sm leading-relaxed mb-6" style={{ color: 'var(--text-faint)' }}>
              إكسسوارات فاخرة للمرأة المصرية العصرية.
            </p>

            {/* Social */}
            <div className="flex items-center gap-2">
              {[
                { href: 'https://instagram.com/luxeaccessories.eg', icon: Instagram, label: 'Instagram' },
                { href: 'https://facebook.com/luxeaccessories.eg',  icon: Facebook,  label: 'Facebook' },
                { href: `https://wa.me/${WHATSAPP.replace(/\+/g, '')}`, icon: MessageCircle, label: 'WhatsApp' },
              ].map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 border flex items-center justify-center transition-colors"
                  style={{ borderColor: 'var(--border-strong)', color: 'var(--text-faint)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--text)';
                    e.currentTarget.style.color = 'var(--text)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-strong)';
                    e.currentTarget.style.color = 'var(--text-faint)';
                  }}
                >
                  <Icon size={15} strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3
              className="text-[10px] tracking-[0.25em] uppercase mb-5 font-medium"
              style={{ color: 'var(--text)' }}
            >
              Shop
            </h3>
            <ul className="space-y-3">
              {shopLinks.map((l) => (
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
            <h3
              className="text-[10px] tracking-[0.25em] uppercase mb-5 font-medium"
              style={{ color: 'var(--text)' }}
            >
              Help
            </h3>
            <ul className="space-y-3">
              {helpLinks.map((l) => (
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
            <h3
              className="text-[10px] tracking-[0.25em] uppercase mb-5 font-medium"
              style={{ color: 'var(--text)' }}
            >
              Contact
            </h3>
            <ul className="space-y-4">
              <li>
                <a
                  href={`https://wa.me/${WHATSAPP.replace(/\+/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 text-sm transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                  <Phone size={14} strokeWidth={1.5} className="mt-0.5 shrink-0" style={{ color: 'var(--pink)' }} />
                  <div>
                    <span className="block">{WHATSAPP}</span>
                    <span className="font-arabic text-xs mt-0.5 block" style={{ color: 'var(--text-faint)' }}>
                      واتساب — السبت–الخميس ١٠ص–١٠م
                    </span>
                  </div>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${EMAIL}`}
                  className="flex items-center gap-3 text-sm transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                  <Mail size={14} strokeWidth={1.5} className="shrink-0" style={{ color: 'var(--pink)' }} />
                  {EMAIL}
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm" style={{ color: 'var(--text-muted)' }}>
                <MapPin size={14} strokeWidth={1.5} className="mt-0.5 shrink-0" style={{ color: 'var(--pink)' }} />
                <div>
                  Cairo, Egypt
                  <span className="font-arabic block text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>
                    القاهرة، مصر
                  </span>
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
      <div
        className="border-t py-5"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
            © {year} Luxe Accessories Egypt. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {helpLinks.slice(2).map((l) => (
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
