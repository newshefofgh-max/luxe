'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag } from 'lucide-react';
import { IProduct } from '@/types';
import { useCartStore } from '@/context/CartContext';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: IProduct;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [wishlisted, setWishlisted] = useState(false);
  const [img1Loaded, setImg1Loaded] = useState(false);
  const [img2Loaded, setImg2Loaded] = useState(false);
  const [hovered, setHovered]       = useState(false);
  const addItem  = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const isOutOfStock = product.stock === 0;
  const isLowStock   = product.stock > 0 && product.stock < 5;

  const primaryImg   = product.images?.[0] ?? 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600&q=80';
  const secondaryImg = product.images?.[1] ?? primaryImg;
  const hasDualImg   = (product.images?.length ?? 0) > 1;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) return;
    addItem(product, 1);
    toast.success(<span className="font-arabic text-sm">{product.nameAr} — أُضيف للسلة</span>);
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

        {/* Image container */}
        <div
          className="relative aspect-[3/4] overflow-hidden mb-3"
          style={{ backgroundColor: 'var(--surface-alt)' }}
        >
          {/* Skeleton */}
          {!img1Loaded && <div className="absolute inset-0 skeleton" />}

          {/* Primary image */}
          <Image
            src={primaryImg}
            alt={product.name}
            fill
            className={`object-cover transition-opacity duration-500 ${img1Loaded ? 'opacity-100' : 'opacity-0'} ${hovered && hasDualImg ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => setImg1Loaded(true)}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Secondary image (Velvet hover effect) */}
          {hasDualImg && (
            <Image
              src={secondaryImg}
              alt={`${product.name} alt view`}
              fill
              className={`object-cover transition-opacity duration-500 ${hovered && img2Loaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImg2Loaded(true)}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          )}

          {/* Badges */}
          <div className="absolute top-2.5 start-2.5 flex flex-col gap-1 z-10">
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
                style={{ backgroundColor: 'rgba(0,0,0,0.65)', color: '#fff' }}
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

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            className="absolute top-2.5 end-2.5 z-10 w-8 h-8 flex items-center justify-center transition-all"
            style={{
              backgroundColor: 'var(--surface)',
              opacity: hovered || wishlisted ? 1 : 0,
              boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
            }}
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
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.18 }}
                onClick={handleAddToCart}
                className="absolute bottom-0 start-0 end-0 py-3 text-[10px] tracking-[0.22em] uppercase font-medium flex items-center justify-center gap-2 z-10"
                style={{ backgroundColor: 'var(--text)', color: 'var(--bg)' }}
              >
                <ShoppingBag size={12} strokeWidth={1.5} />
                Add to Bag
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Info */}
        <div>
          <p className="section-tag mb-1">{product.category}</p>
          <h3
            className="text-sm font-bold line-clamp-1 mb-0.5 transition-colors group-hover:underline"
            style={{ color: 'var(--text)' }}
          >
            {product.name}
          </h3>
          <p className="font-arabic text-xs line-clamp-1 mb-2" style={{ color: 'var(--text-faint)' }}>
            {product.nameAr}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-black" style={{ color: 'var(--text)' }}>
              {product.price.toLocaleString('ar-EG')} ج.م
            </span>
            {product.comparePrice && (
              <span className="text-xs line-through" style={{ color: 'var(--text-faint)' }}>
                {product.comparePrice.toLocaleString('ar-EG')}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
