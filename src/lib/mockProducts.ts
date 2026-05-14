import type { IProduct } from '@/types';

const NAMES = [
  'Gold Chain Bracelet', 'Pearl Drop Necklace', 'Statement Ring', 'Vintage Sunglasses',
  'Rose Gold Bangle', 'Crystal Pendant', 'Stacking Rings Set', 'Cat Eye Shades',
  'Tennis Bracelet', 'Choker Necklace', 'Signet Ring', 'Aviator Sunglasses',
];
const NAMES_AR = [
  'أسورة سلسلة ذهبية', 'قلادة لؤلؤة', 'خاتم مميز', 'نظارات كلاسيكية',
  'أسورة ذهب وردي', 'قلادة كريستال', 'طقم خواتم', 'نظارات كاتس آي',
  'أسورة تنس', 'قلادة تشوكر', 'خاتم سيجنيت', 'نظارات أفياتور',
];
const IMAGES = [
  'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600&q=80',
  'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80',
  'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80',
  'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80',
  'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=80',
  'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80',
  'https://images.unsplash.com/photo-1598560917505-59a3ad559071?w=600&q=80',
  'https://images.unsplash.com/photo-1577803645773-f96470509666?w=600&q=80',
  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80',
  'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&q=80',
  'https://images.unsplash.com/photo-1603561596112-db542bfa6d99?w=600&q=80',
  'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&q=80',
];
const CATS = ['bracelets', 'necklaces', 'rings', 'sunglasses'] as const;

export function getMockProducts(count = 12): IProduct[] {
  const prices = [299, 450, 199, 350, 280, 520, 389, 310, 410, 360, 230, 390];
  const compares = [399, 600, 250, 450, 350, 680, 500, 420, 540, 480, 310, 510];
  const stocks = [12, 3, 8, 2, 15, 6, 4, 9, 7, 11, 5, 14];
  const solds = [120, 85, 34, 67, 23, 91, 55, 40, 78, 62, 31, 49];

  return Array.from({ length: Math.min(count, NAMES.length) }, (_, i) => ({
    _id: `mock-${i}`,
    name: NAMES[i],
    nameAr: NAMES_AR[i],
    slug: `product-${i + 1}`,
    description: 'Premium luxury accessory crafted with finest materials.',
    descriptionAr: 'إكسسوار فاخر مصنوع من أجود المواد.',
    price: prices[i],
    comparePrice: compares[i],
    images: [IMAGES[i]],
    category: CATS[i % 4],
    variants: [],
    stock: stocks[i],
    sold: solds[i],
    isActive: true,
    isFeatured: i < 8,
    tags: ['luxury', 'featured'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
}
