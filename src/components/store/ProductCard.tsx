'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { IProduct } from '@/types';
import { useCartStore } from '@/context/CartContext';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: IProduct;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [wishlisted, setWishlisted] = useState(false);
  const [imgLoaded, setImgLoaded]   = useState(false);
  const [hovered, setHovered]       = useState(false);
  const addItem  = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const isOutOfStock = product.stock === 0;
  const isLowStock   = product.stock > 0 && product.stock < 5;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) return;
    addItem(product, 1);
    toast.success(
      <span className="font-arabic text-sm">{product.nameAr} — أُضيف للسلة</span>
    );
    openCart();
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    setWishlisted((v) => !v);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      <Link href={`/products/${product.slug}`} className="group block">
        {/* Image */}
        <div
          className="relative aspect-[3/4] overflow-hidden mb-3"
          style={{ backgroundColor: 'var(--surface-alt)' }}
        >
          {/* Skeleton */}
          {!imgLoaded && <div className="absolute inset-0 skeleton" />}

          <motion.div
            animate={{ scale: hovered ? 1.06 : 1 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="absolute inset-0"
          >
            <Image
              src={
                product.images?.[0] ||
                'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600&q=80'
              }
              alt={product.name}
              fill
              className={`object-cover transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImgLoaded(true)}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          </motion.div>

          {/* Badges — top left */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
            {discount > 0 && (
              <span
                className="text-[10px] font-semibold tracking-wider px-2 py-0.5"
                style={{ backgroundColor: 'var(--pink)', color: '#fff' }}
              >
                -{discount}%
              </span>
            )}
            {isOutOfStock && (
              <span
                className="text-[10px] tracking-wider px-2 py-0.5"
                style={{ backgroundColor: 'var(--surface-alt)', color: 'var(--text-faint)' }}
              >
                SOLD OUT
              </span>
            )}
            {isLowStock && !isOutOfStock && (
              <span
                className="text-[10px] tracking-wider px-2 py-0.5"
                style={{ backgroundColor: 'var(--pink)', color: '#fff' }}
              >
                LAST {product.stock}
              </span>
            )}
          </div>

          {/* Wishlist — top right */}
          <button
            onClick={handleWishlist}
            className="absolute top-2.5 right-2.5 w-8 h-8 flex items-center justify-center transition-all"
            style={{ backgroundColor: 'var(--bg)', opacity: hovered || wishlisted ? 1 : 0 }}
            aria-label="Wishlist"
          >
            <Heart
              size={14}
              strokeWidth={1.5}
              className={wishlisted ? 'fill-current' : ''}
              style={{ color: wishlisted ? 'var(--pink)' : 'var(--text-muted)' }}
            />
          </button>

          {/* Quick-add overlay */}
          <AnimatePresence>
            {hovered && !isOutOfStock && (
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2 }}
                onClick={handleAddToCart}
                className="absolute bottom-0 left-0 right-0 py-3 text-[11px] tracking-[0.2em] uppercase font-medium flex items-center justify-center gap-2 transition-colors"
                style={{ backgroundColor: 'var(--text)', color: 'var(--bg)' }}
              >
                <ShoppingBag size={13} strokeWidth={1.5} />
                Add to Bag
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Info */}
        <div>
          {/* Category */}
          <p className="section-tag mb-1">
            {product.category}
          </p>

          {/* Name */}
          <h3
            className="text-sm font-bold line-clamp-1 mb-0.5 transition-colors group-hover:underline"
            style={{ color: 'var(--text)' }}
          >
            {product.name}
          </h3>
          <p
            className="font-arabic text-xs line-clamp-1 mb-2"
            style={{ color: 'var(--text-faint)' }}
          >
            {product.nameAr}
          </p>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span
              className="text-sm font-black"
              style={{ color: 'var(--text)' }}
            >
              {product.price.toLocaleString('ar-EG')} ج.م
            </span>
            {product.comparePrice && (
              <span
                className="text-xs line-through"
                style={{ color: 'var(--text-faint)' }}
              >
                {product.comparePrice.toLocaleString('ar-EG')}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
