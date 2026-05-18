import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import CartSidebar from '@/components/store/CartSidebar';
import ThemeApplier from '@/components/ThemeApplier';

export const metadata: Metadata = {
  title: {
    default: 'Accessory | إكسسوارات',
    template: '%s | Accessory',
  },
  description:
    'Premium Egyptian fashion accessories — bracelets, necklaces, rings, and sunglasses. Shop with confidence, pay on delivery. إكسسوارات مصرية فاخرة — ادفع عند الاستلام.',
  keywords: [
    'Egyptian accessories',
    'luxury jewelry',
    'إكسسوارات مصرية',
    'مجوهرات فاخرة',
    'bracelets Egypt',
    'necklaces Egypt',
    'cash on delivery Egypt',
    'دفع عند الاستلام',
  ],
  openGraph: {
    type: 'website',
    locale: 'ar_EG',
    alternateLocale: 'en_US',
    siteName: 'Accessory',
    title: 'Accessory | إكسسوارات',
    description: 'Premium Egyptian fashion accessories. Pay on delivery across all governorates.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Accessory',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Accessory | إكسسوارات',
    description: 'Premium Egyptian fashion accessories. Pay on delivery.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Playfair Display for editorial headings, DM Sans as FT System Blank fallback, Cairo as Milligram Arabic fallback */}
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700;1,800;1,900&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800;9..40,900&family=Cairo:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-page text-theme-text antialiased">
        <ThemeApplier />
        <AuthProvider>
          {children}
          <CartSidebar />
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#ffffff',
                color: '#1b1710',
                border: '1px solid rgba(0,0,0,0.14)',
                borderRadius: '2px',
                fontFamily: "'FT System Blank', 'DM Sans', sans-serif",
                fontWeight: '600',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              },
              success: {
                iconTheme: {
                  primary: '#E91E8C',
                  secondary: '#ffffff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#ffffff',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
