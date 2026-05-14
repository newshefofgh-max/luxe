'use client';

import { motion } from 'framer-motion';
import ProductCard from './ProductCard';
import type { IProduct } from '@/types';

interface ProductGridProps {
  products: IProduct[];
  loading?: boolean;
  columns?: 2 | 3 | 4;
}

const SkeletonCard = () => (
  <div className="animate-pulse">
    <div className="bg-surface aspect-square rounded-sm mb-3" />
    <div className="bg-surface h-4 rounded mb-2 w-3/4" />
    <div className="bg-surface h-4 rounded w-1/3" />
  </div>
);

export default function ProductGrid({ products, loading = false, columns = 4 }: ProductGridProps) {
  const gridClass = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  }[columns];

  if (loading) {
    return (
      <div className={`grid ${gridClass} gap-4 md:gap-6`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl text-white mb-2">لا توجد منتجات</h3>
        <p className="text-gray-400">جرب تغيير الفلتر أو البحث بكلمة مختلفة</p>
      </div>
    );
  }

  return (
    <div className={`grid ${gridClass} gap-4 md:gap-6`}>
      {products.map((product, i) => (
        <motion.div
          key={product._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
        >
          <ProductCard product={product} />
        </motion.div>
      ))}
    </div>
  );
}
