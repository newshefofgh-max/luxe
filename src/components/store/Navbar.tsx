'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, User, Menu, X, Sun, Moon, Search } from 'lucide-react';
import { useCartStore, useCartCount } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useThemeStore } from '@/stores/themeStore';
import AnnouncementBar from './AnnouncementBar';

interface NavCategory { slug: string; nameEn: string; nameAr: string; }
interface NavbarProps {
  announcementContent?: {
    visible?: boolean;
    items_en?: string[];
    items_ar?: string[];
    bg_color?: string;
    text_color?: string;
  };
}

export default function Navbar({ announcementContent }: NavbarProps) {
  const pathname  = usePathname();
  const router    = useRouter();
  const [scrolled, setScrolled]       = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [lang, setLang]               = useState<'en' | 'ar'>('en');
  const [searchOpen, setSearchOpen]   = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const openCart  = useCartStore((s) => s.openCart);
  const cartCount = useCartCount();
  const { currentUser } = useAuth();
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';

  const [categories, setCategories] = useState<NavCategory[]>([]);

  const t = (en: string, ar: string) => lang === 'ar' ? ar : en;

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data) => { if (data.data?.length) setCategories(data.data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Focus input when overlay opens; close on Escape
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSearchOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setSearchOpen(false);
    setSearchQuery('');
    router.push(`/products?search=${encodeURIComponent(q)}`);
  };

  useEffect(() => {
    document.documentElement.dir  = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const announcementVisible = announcementContent?.visible !== false;
  const announcementHeight  = announcementVisible ? 36 : 0;
  const navHeight           = 72;
  const categoryBarHeight   = 40;
  const totalHeight         = announcementHeight + navHeight + categoryBarHeight;

  const iconBtn = 'flex items-center justify-center w-9 h-9 transition-colors';

  return (
    <>
      {/* ── Fixed header wrapper ───────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-shadow duration-300"
        style={{
          backgroundColor: 'var(--bg)',
          boxShadow: scrolled ? '0 1px 12px rgba(0,0,0,0.08)' : 'none',
          borderBottom: scrolled ? '1px solid var(--border-strong)' : '1px solid var(--border)',
        }}
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
      >
        {/* Announcement bar */}
        <AnnouncementBar content={announcementContent} lang={lang} />

        {/* ── Main nav row (logo centered) ──────────────────────── */}
        <div
          className="relative flex items-center justify-between px-4 sm:px-8"
          style={{ height: `${navHeight}px` }}
        >
          {/* Left: desktop nav links */}
          <nav className="hidden md:flex items-center gap-7">
            <Link
              href="/"
              className="text-[11px] tracking-[0.18em] uppercase font-medium transition-colors underline-hover"
              style={{ color: pathname === '/' ? 'var(--text)' : 'var(--text-muted)' }}
            >
              {t('Home', 'الرئيسية')}
            </Link>
            <Link
              href="/products"
              className="text-[11px] tracking-[0.18em] uppercase font-medium transition-colors underline-hover"
              style={{ color: pathname === '/products' ? 'var(--text)' : 'var(--text-muted)' }}
            >
              {t('New In', 'الجديد')}
            </Link>
            <Link
              href="/products?sort=sale"
              className="text-[11px] tracking-[0.18em] uppercase font-bold underline-hover"
              style={{ color: 'var(--pink)' }}
            >
              {t('Sale', 'تخفيضات')}
            </Link>
          </nav>

          {/* Center: Logo (absolutely centered) */}
          <Link
            href="/"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
          >
            <span
              className="font-display text-2xl leading-none tracking-tight font-black italic"
              style={{ color: 'var(--text)' }}
            >
              Accessory
            </span>
            <span
              className="text-[7px] tracking-[0.5em] uppercase font-bold"
              style={{ color: 'var(--pink)' }}
            >
              Accessories
            </span>
          </Link>

          {/* Right: icons */}
          <div className="flex items-center gap-1">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className={`${iconBtn} text-[var(--text-muted)] hover:text-[var(--text)]`}
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
                  {isDark ? <Sun size={17} strokeWidth={1.5} /> : <Moon size={17} strokeWidth={1.5} />}
                </motion.span>
              </AnimatePresence>
            </button>

            {/* Language toggle */}
            <button
              onClick={() => setLang((l) => l === 'en' ? 'ar' : 'en')}
              className="hidden md:flex items-center text-[10px] tracking-[0.15em] uppercase font-bold px-2 py-1 transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              {lang === 'en' ? 'عربي' : 'EN'}
            </button>

            {/* Account */}
            <Link
              href={currentUser ? '/account' : '/account/login'}
              className={`hidden md:flex ${iconBtn} text-[var(--text-muted)] hover:text-[var(--text)]`}
              aria-label="Account"
            >
              <User size={18} strokeWidth={1.5} />
            </Link>

            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className={`${iconBtn} text-[var(--text-muted)] hover:text-[var(--text)]`}
              aria-label="Search"
            >
              <Search size={18} strokeWidth={1.5} />
            </button>

            {/* Cart */}
            <button
              onClick={openCart}
              className={`relative ${iconBtn} text-[var(--text-muted)] hover:text-[var(--text)]`}
              aria-label="Cart"
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    key="badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
                    style={{ backgroundColor: 'var(--pink)', color: isDark ? '#1a1a18' : '#fff' }}
                  >
                    {cartCount > 9 ? '9+' : cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className={`md:hidden ${iconBtn} ms-1 text-[var(--text-muted)] hover:text-[var(--text)]`}
              aria-label="Menu"
            >
              {mobileOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
            </button>
          </div>
        </div>

        {/* ── Category strip (desktop) ───────────────────────────── */}
        <div
          className="hidden md:flex items-center justify-center gap-8 border-t"
          style={{
            height: `${categoryBarHeight}px`,
            borderColor: 'var(--border)',
          }}
        >
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.slug}`}
              className="text-[10px] tracking-[0.22em] uppercase font-medium transition-colors underline-hover"
              style={{
                color: pathname.includes(`category=${cat.slug}`) ? 'var(--text)' : 'var(--text-muted)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = pathname.includes(`category=${cat.slug}`) ? 'var(--text)' : 'var(--text-muted)')}
            >
              {lang === 'ar' ? cat.nameAr : cat.nameEn}
            </Link>
          ))}
        </div>
      </header>

      {/* ── Full-screen Search Overlay ─────────────────────────── */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] flex flex-col items-center justify-start pt-32 px-6"
            style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false); }}
          >
            <motion.div
              initial={{ y: -24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -24, opacity: 0 }}
              transition={{ duration: 0.22, delay: 0.05 }}
              className="w-full max-w-2xl"
            >
              {/* Label */}
              <p className="text-center text-[10px] tracking-[0.4em] uppercase mb-6 font-medium" style={{ color: 'var(--gold)' }}>
                {lang === 'ar' ? 'ابحث عن منتجاتك' : 'Search our store'}
              </p>

              {/* Search form */}
              <form onSubmit={handleSearch} className="relative flex items-center">
                <Search
                  size={22}
                  strokeWidth={1.5}
                  className="absolute left-5 pointer-events-none"
                  style={{ color: 'rgba(255,255,255,0.4)' }}
                />
                <input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={lang === 'ar' ? 'ابحث عن منتج...' : 'Search for a product...'}
                  className="w-full pl-14 pr-14 py-5 text-xl bg-white/10 border border-white/20 text-white placeholder-white/40 outline-none focus:border-white/50 transition-colors"
                  style={{ fontFamily: 'inherit', letterSpacing: '0.02em' }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-5 text-white/40 hover:text-white/80 transition-colors"
                  >
                    <X size={18} strokeWidth={1.5} />
                  </button>
                )}
              </form>

              {/* Hint */}
              <p className="text-center mt-4 text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {lang === 'ar' ? 'اضغط Enter للبحث · Esc للإغلاق' : 'Press Enter to search · Esc to close'}
              </p>
            </motion.div>

            {/* Close button */}
            <button
              onClick={() => setSearchOpen(false)}
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center border border-white/20 text-white/60 hover:text-white hover:border-white/50 transition-colors"
            >
              <X size={18} strokeWidth={1.5} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div style={{ height: totalHeight }} />

      {/* ── Mobile drawer ──────────────────────────────────────── */}
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
              className="fixed top-0 bottom-0 w-72 z-50 md:hidden flex flex-col border-e"
              style={{
                backgroundColor: 'var(--bg)',
                borderColor: 'var(--border-strong)',
                [lang === 'ar' ? 'right' : 'left']: 0,
              }}
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
                <div>
                  <span className="font-display text-xl italic font-black" style={{ color: 'var(--text)' }}>Accessory</span>
                  <span className="block text-[7px] tracking-[0.45em] uppercase mt-0.5" style={{ color: 'var(--pink)' }}>STORE</span>
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
                  { href: '/products?sort=sale', label: t('Sale', 'تخفيضات'), gold: true },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-6 py-4 text-[11px] tracking-[0.2em] uppercase border-b transition-colors"
                    style={{
                      borderColor: 'var(--border)',
                      color: link.gold ? 'var(--pink)' : 'var(--text-muted)',
                      fontWeight: link.gold ? 700 : 500,
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
                    {lang === 'ar' ? cat.nameAr : cat.nameEn}
                  </Link>
                ))}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
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
                  >
                    {isDark ? <Sun size={14} strokeWidth={1.5} /> : <Moon size={14} strokeWidth={1.5} />}
                  </button>
                  <button
                    onClick={() => setLang((l) => l === 'en' ? 'ar' : 'en')}
                    className="text-[10px] tracking-[0.15em] uppercase px-2.5 py-1.5 border transition-colors"
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
