import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Theme-aware (CSS variables) ──────────────────────────
        page:        'var(--bg)',
        'page-alt':  'var(--bg-alt)',
        surface:     'var(--surface)',
        'surface-alt': 'var(--surface-alt)',
        'theme-text':  'var(--text)',
        'theme-muted': 'var(--text-muted)',
        'theme-faint': 'var(--text-faint)',
        'theme-border':'var(--border)',
        // ── Brand ──────────────────────────────────────────────
        primary: {
          DEFAULT: '#C9A84C',
          50:  '#fdf8ee',
          100: '#f9efd0',
          200: '#f3dc9d',
          300: '#ecc463',
          400: '#e5ae3c',
          500: '#C9A84C',
          600: '#b08a32',
          700: '#8c6b27',
          800: '#735626',
          900: '#614724',
          950: '#372511',
        },
        secondary: {
          DEFAULT: '#1a1a2e',
          50:  '#f0f0f8',
          100: '#e4e4f0',
          200: '#ccccdf',
          300: '#a8a8c4',
          400: '#7e7ea5',
          500: '#62628b',
          600: '#4f4f73',
          700: '#3f3f5e',
          800: '#2e2e4d',
          900: '#1a1a2e',
          950: '#0e0e1a',
        },
        accent: {
          DEFAULT: '#e8b4b8',
          50:  '#fdf5f5',
          100: '#fce8ea',
          200: '#f9d4d7',
          300: '#f4b5ba',
          400: '#e8b4b8',
          500: '#d98b91',
          600: '#c56470',
          700: '#a64a56',
          800: '#8a3f49',
          900: '#753843',
          950: '#401b21',
        },
        gold:     '#E91E8C',
        pink:     '#E91E8C',
        'pink-dark': '#C2185B',
        'pink-light': '#FFE1F9',
        navy:     '#1b1710',
        roseGold: '#e8b4b8',
      },
      fontFamily: {
        heading: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        arabic: ['Cairo', 'Tajawal', 'Arial', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem',
      },
      boxShadow: {
        'gold': '0 4px 14px 0 rgba(201, 168, 76, 0.39)',
        'gold-lg': '0 10px 40px 0 rgba(201, 168, 76, 0.25)',
        'navy': '0 4px 14px 0 rgba(26, 26, 46, 0.3)',
        'card': '0 2px 20px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 8px 30px rgba(0, 0, 0, 0.15)',
        'inner-gold': 'inset 0 2px 4px rgba(201, 168, 76, 0.2)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #C9A84C 0%, #e5c97a 50%, #C9A84C 100%)',
        'navy-gradient': 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        'hero-pattern': "url('/images/hero-pattern.svg')",
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'shimmer': 'shimmer 2s infinite',
        'pulse-gold': 'pulseGold 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGold: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7', boxShadow: '0 0 20px rgba(201, 168, 76, 0.6)' },
        },
      },
      screens: {
        'xs': '475px',
      },
    },
  },
  plugins: [
    // RTL support plugin (inline implementation)
    function ({ addUtilities, addVariant }: { addUtilities: Function; addVariant: Function }) {
      // RTL variant
      addVariant('rtl', '[dir="rtl"] &');
      addVariant('ltr', '[dir="ltr"] &');

      // Logical property utilities for RTL/LTR
      addUtilities({
        '.ms-auto': { 'margin-inline-start': 'auto' },
        '.me-auto': { 'margin-inline-end': 'auto' },
        '.ps-0': { 'padding-inline-start': '0' },
        '.pe-0': { 'padding-inline-end': '0' },
        '.ps-1': { 'padding-inline-start': '0.25rem' },
        '.pe-1': { 'padding-inline-end': '0.25rem' },
        '.ps-2': { 'padding-inline-start': '0.5rem' },
        '.pe-2': { 'padding-inline-end': '0.5rem' },
        '.ps-3': { 'padding-inline-start': '0.75rem' },
        '.pe-3': { 'padding-inline-end': '0.75rem' },
        '.ps-4': { 'padding-inline-start': '1rem' },
        '.pe-4': { 'padding-inline-end': '1rem' },
        '.ps-6': { 'padding-inline-start': '1.5rem' },
        '.pe-6': { 'padding-inline-end': '1.5rem' },
        '.ps-8': { 'padding-inline-start': '2rem' },
        '.pe-8': { 'padding-inline-end': '2rem' },
        '.text-start': { 'text-align': 'start' },
        '.text-end': { 'text-align': 'end' },
        '.float-start': { float: 'inline-start' },
        '.float-end': { float: 'inline-end' },
        '.border-s': { 'border-inline-start-width': '1px' },
        '.border-e': { 'border-inline-end-width': '1px' },
        '.rounded-s': { 'border-start-start-radius': '0.25rem', 'border-end-start-radius': '0.25rem' },
        '.rounded-e': { 'border-start-end-radius': '0.25rem', 'border-end-end-radius': '0.25rem' },
      });
    },
  ],
};

export default config;
