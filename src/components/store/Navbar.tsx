'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, User, Menu, X, ChevronDown, Sun, Moon, Search } from 'lucide-react';
import { useCartStore, useCartCount } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useThemeStore } from '@/stores/themeStore';

const categories = [
  { slug: 'bracelets', en: 'Bracelets',  ar: 'أساور' },
  { slug: 'necklaces', en: 'Necklaces',  ar: 'قلادات' },
  { slug: 'rings',     en: 'Rings',      ar: 'خواتم' },
  { slug: 'sunglasses',en: 'Sunglasses', ar: 'نظارات' },
];

export default function Navbar() {
  const pathname      = usePathname();
  const [scrolled, setScrolled]         = useState(false);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [lang, setLang]                 = useState<'en' | 'ar'>('en');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const openCart    = useCartStore((s) => s.openCart);
  const cartCount   = useCartCount();
  const { currentUser } = useAuth();
  const { theme, toggleTheme } = useThemeStore();

  const t   = (en: string, ar: string) => (lang === 'ar' ? ar : en);
  const isDark = theme === 'dark';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdownOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  useEffect(() => {
    document.documentElement.dir  = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  /* ── Accessorize-style: flat white, sharp bottom border on scroll ── */
  const navBase = 'fixed top-0 left-0 right-0 z-50 transition-all duration-300';
  const navBg   = scrolled
    ? 'bg-[var(--bg)] border-b border-[var(--border-strong)] shadow-sm'
    : 'bg-[var(--bg)] border-b border-[var(--border)]';

  const linkCls = (active: boolean) =>
    `text-[11px] tracking-[0.18em] uppercase font-bold transition-colors underline-hover ${
      active ? 'text-[var(--text)]' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
    }`;

  const iconBtn = 'flex items-center justify-center w-9 h-9 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors';

  return (
    <>
      <nav className={`${navBase} ${navBg}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>

        {/* ── Top utility bar — Accessorize #FFE1F9 pink banner ────── */}
        <div
          className="hidden md:flex items-center justify-between px-8 py-1.5 border-b"
          style={{ borderColor: 'rgba(233,30,140,0.15)', backgroundColor: '#FFE1F9' }}
        >
          <p className="text-[10px] tracking-[0.2em] uppercase" style={{ color: '#C2185B' }}>
            {t('Free delivery on orders over 500 EGP', 'توصيل مجاني للطلبات فوق ٥٠٠ جنيه')}
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLang((l) => (l === 'en' ? 'ar' : 'en'))}
              className="text-[10px] tracking-[0.2em] uppercase transition-colors"
              style={{ color: '#C2185B' }}
            >
              {lang === 'en' ? 'العربية' : 'English'}
            </button>
            <span style={{ color: 'rgba(194,24,91,0.3)' }}>|</span>
            <Link
              href={currentUser ? '/account' : '/account/login'}
              className="text-[10px] tracking-[0.2em] uppercase transition-colors"
              style={{ color: '#C2185B' }}
            >
              {currentUser ? t('My Account', 'حسابي') : t('Sign In', 'تسجيل الدخول')}
            </Link>
          </div>
        </div>

        {/* ── Main nav row ──────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">

            {/* Logo */}
            <Link href="/" className="flex flex-col items-start">
              <span
                className="font-display text-2xl leading-none tracking-tight font-black"
                style={{ color: 'var(--text)', fontStyle: 'italic' }}
              >
                Luxe
              </span>
              <span
                className="text-[8px] tracking-[0.4em] uppercase font-bold"
                style={{ color: 'var(--text-faint)' }}
              >
                Accessories
              </span>
            </Link>

            {/* Desktop nav links — centred */}
            <div className="hidden md:flex items-center gap-10">
              <Link href="/" className={linkCls(pathname === '/')}>
                {t('Home', 'الرئيسية')}
              </Link>

              <Link href="/products" className={linkCls(pathname === '/products' && !pathname.includes('?'))}>
                {t('New In', 'الجديد')}
              </Link>

              {/* Categories dropdown */}
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className={`flex items-center gap-1 ${linkCls(pathname.startsWith('/products'))}`}
                >
                  {t('Categories', 'الفئات')}
                  <motion.span
                    animate={{ rotate: dropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-0.5"
                  >
                    <ChevronDown size={12} strokeWidth={1.5} />
                  </motion.span>
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full mt-4 w-52 border shadow-lg"
                      style={{
                        backgroundColor: 'var(--bg)',
                        borderColor: 'var(--border-strong)',
                        [lang === 'ar' ? 'right' : 'left']: '-1rem',
                      }}
                    >
                      {categories.map((cat) => (
                        <Link
                          key={cat.slug}
                          href={`/products?category=${cat.slug}`}
                          onClick={() => setDropdownOpen(false)}
                          className="block px-5 py-3 text-[11px] tracking-[0.15em] uppercase border-b last:border-0 transition-colors"
                          style={{
                            color: 'var(--text-muted)',
                            borderColor: 'var(--border)',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                        >
                          {lang === 'ar' ? cat.ar : cat.en}
                        </Link>
                      ))}
                      <Link
                        href="/products"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-5 py-3 text-[11px] tracking-[0.15em] uppercase font-semibold transition-colors"
                        style={{ color: 'var(--pink)', backgroundColor: 'var(--pink-muted)' }}
                      >
                        {t('Shop All →', 'تسوق الكل ←')}
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link href="/products?sort=sale" className={linkCls(false)} style={{ color: 'var(--pink)' }}>
                {t('Sale', 'تخفيضات')}
              </Link>
            </div>

            {/* Right icons */}
            <div className="flex items-center gap-1">
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className={iconBtn}
                aria-label={isDark ? 'Light mode' : 'Dark mode'}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={theme}
                    initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.18 }}
                  >
                    {isDark ? <Sun size={18} strokeWidth={1.5} /> : <Moon size={18} strokeWidth={1.5} />}
                  </motion.span>
                </AnimatePresence>
              </button>

              {/* Account (desktop) */}
              <Link href={currentUser ? '/account' : '/account/login'} className={`hidden md:flex ${iconBtn}`} aria-label="Account">
                <User size={18} strokeWidth={1.5} />
              </Link>

              {/* Cart */}
              <button onClick={openCart} className={`relative ${iconBtn}`} aria-label="Cart">
                <ShoppingBag size={18} strokeWidth={1.5} />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span
                      key="badge"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
                      style={{ backgroundColor: 'var(--pink)', color: '#fff' }}
                    >
                      {cartCount > 9 ? '9+' : cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen((v) => !v)}
                className={`md:hidden ${iconBtn} ml-1`}
                aria-label="Menu"
              >
                {mobileOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Mobile drawer ──────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: lang === 'ar' ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: lang === 'ar' ? '100%' : '-100%' }}
              transition={{ type: 'tween', duration: 0.28 }}
              className="fixed top-0 bottom-0 w-72 z-50 md:hidden flex flex-col border-r"
              style={{
                backgroundColor: 'var(--bg)',
                borderColor: 'var(--border-strong)',
                [lang === 'ar' ? 'right' : 'left']: 0,
              }}
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
            >
              {/* Drawer header */}
              <div
                className="flex items-center justify-between px-6 py-5 border-b"
                style={{ borderColor: 'var(--border)' }}
              >
                <div>
                  <span className="font-display text-xl italic font-black" style={{ color: 'var(--text)' }}>Luxe</span>
                  <span className="block text-[8px] tracking-[0.35em] uppercase" style={{ color: 'var(--text-faint)' }}>Accessories</span>
                </div>
                <button onClick={() => setMobileOpen(false)} style={{ color: 'var(--text-muted)' }}>
                  <X size={20} strokeWidth={1.5} />
                </button>
              </div>

              {/* Links */}
              <div className="flex-1 overflow-y-auto">
                {[
                  { href: '/', label: t('Home', 'الرئيسية') },
                  { href: '/products', label: t('New In', 'الجديد') },
                  { href: '/products?sort=sale', label: t('Sale', 'تخفيضات'), rose: true },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-6 py-4 text-[11px] tracking-[0.2em] uppercase border-b transition-colors"
                    style={{
                      borderColor: 'var(--border)',
                      color: link.rose ? 'var(--pink)' : (pathname === link.href ? 'var(--text)' : 'var(--text-muted)'),
                    }}
                  >
                    {link.label}
                  </Link>
                ))}

                <p className="px-6 pt-5 pb-2 text-[9px] tracking-[0.3em] uppercase" style={{ color: 'var(--text-faint)' }}>
                  {t('Categories', 'الفئات')}
                </p>
                {categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/products?category=${cat.slug}`}
                    onClick={() => setMobileOpen(false)}
                    className="block px-6 py-3 text-[11px] tracking-[0.15em] uppercase border-b transition-colors"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                  >
                    {lang === 'ar' ? cat.ar : cat.en}
                  </Link>
                ))}
              </div>

              {/* Drawer footer */}
              <div
                className="px-6 py-4 border-t flex items-center justify-between"
                style={{ borderColor: 'var(--border)' }}
              >
                <Link
                  href={currentUser ? '/account' : '/account/login'}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <User size={15} strokeWidth={1.5} />
                  {currentUser ? t('Account', 'حسابي') : t('Sign In', 'دخول')}
                </Link>
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleTheme}
                    className="p-1.5 border transition-colors"
                    style={{ borderColor: 'var(--border-strong)', color: 'var(--text-muted)' }}
                    aria-label="Toggle theme"
                  >
                    {isDark ? <Sun size={14} strokeWidth={1.5} /> : <Moon size={14} strokeWidth={1.5} />}
                  </button>
                  <button
                    onClick={() => setLang((l) => (l === 'en' ? 'ar' : 'en'))}
                    className="text-[10px] tracking-[0.2em] uppercase px-3 py-1.5 border transition-colors"
                    style={{ borderColor: 'var(--border-strong)', color: 'var(--text-muted)' }}
                  >
                    {lang === 'en' ? 'عربي' : 'EN'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
