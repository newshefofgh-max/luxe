'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import {
  useCartStore,
  useCartItems,
  useCartIsOpen,
  useCartSubtotal,
} from '@/context/CartContext';
import type { IProduct } from '@/types';

function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: 'var(--surface-alt)' }}
        >
          <ShoppingBag size={32} strokeWidth={1.5} style={{ color: 'var(--text-faint)' }} />
        </div>
      </motion.div>
      <h3 className="text-sm font-medium tracking-wider uppercase mb-2" style={{ color: 'var(--text)' }}>
        Your bag is empty
      </h3>
      <p className="font-arabic text-sm mb-1" style={{ color: 'var(--text-faint)' }}>سلتك فارغة</p>
      <p className="text-xs" style={{ color: 'var(--text-faint)' }}>Discover our collection →</p>
    </div>
  );
}

export default function CartSidebar() {
  const isOpen    = useCartIsOpen();
  const items     = useCartItems();
  const subtotal  = useCartSubtotal();
  const { closeCart, removeItem, updateQuantity, addItem } = useCartStore();
  const [upsell, setUpsell] = useState<IProduct[]>([]);

  useEffect(() => {
    if (!isOpen || items.length === 0) return;
    const cartIds = new Set(items.map((i) => i.product._id));
    fetch('/api/products?limit=8')
      .then((r) => r.json())
      .then((data) => {
        const suggestions = (data.data?.products ?? [] as IProduct[])
          .filter((p: IProduct) => !cartIds.has(p._id) && p.stock > 0)
          .slice(0, 3);
        setUpsell(suggestions);
      })
      .catch(() => {});
  }, [isOpen, items.length]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-50"
            onClick={closeCart}
          />

          {/* Sidebar */}
          <motion.aside
            key="sidebar"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md z-50 flex flex-col shadow-2xl"
            style={{ backgroundColor: 'var(--bg)', borderLeft: '1px solid var(--border-strong)' }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-5 border-b"
              style={{ borderColor: 'var(--border-strong)' }}
            >
              <div className="flex items-center gap-3">
                <ShoppingBag size={18} strokeWidth={1.5} style={{ color: 'var(--pink)' }} />
                <div>
                  <h2
                    className="text-sm font-medium tracking-[0.15em] uppercase"
                    style={{ color: 'var(--text)' }}
                  >
                    Shopping Bag
                  </h2>
                  <p className="font-arabic text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>
                    {items.length > 0
                      ? `${items.reduce((s, i) => s + i.quantity, 0)} منتج`
                      : 'سلة التسوق'}
                  </p>
                </div>
              </div>
              <button
                onClick={closeCart}
                className="w-8 h-8 flex items-center justify-center transition-colors"
                style={{ color: 'var(--text-muted)' }}
                aria-label="Close"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            {/* COD Badge */}
            {items.length > 0 && (
              <div
                className="mx-4 mt-3 px-4 py-2.5 border flex items-center gap-2"
                style={{ backgroundColor: 'var(--pink-muted)', borderColor: 'rgba(233,30,140,0.2)' }}
              >
                <span className="text-base">💛</span>
                <div>
                  <p className="font-arabic text-xs font-semibold" style={{ color: 'var(--pink)' }}>
                    ادفع عند الاستلام
                  </p>
                  <p className="text-[10px] tracking-wide" style={{ color: 'var(--text-faint)' }}>
                    Cash on Delivery — no upfront payment
                  </p>
                </div>
              </div>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto py-4 px-4">
              {items.length === 0 ? (
                <EmptyCart />
              ) : (
                <div className="space-y-3">
                  <AnimatePresence initial={false}>
                    {items.map((item) => {
                      const key = `${item.product._id}-${JSON.stringify(item.selectedVariants || {})}`;
                      return (
                        <motion.div
                          key={key}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20, height: 0 }}
                          transition={{ duration: 0.22 }}
                          className="flex gap-3 p-3 border"
                          style={{
                            backgroundColor: 'var(--surface)',
                            borderColor: 'var(--border-strong)',
                          }}
                        >
                          {/* Image */}
                          <div
                            className="relative w-20 h-20 flex-shrink-0 overflow-hidden"
                            style={{ backgroundColor: 'var(--surface-alt)' }}
                          >
                            <Image
                              src={
                                item.product.images?.[0] ||
                                'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=200&q=80'
                              }
                              alt={item.product.name}
                              fill
                              className="object-cover"
                            />
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="text-sm font-medium line-clamp-1" style={{ color: 'var(--text)' }}>
                                  {item.product.name}
                                </h4>
                                <p className="font-arabic text-xs line-clamp-1 mt-0.5" style={{ color: 'var(--text-faint)' }}>
                                  {item.product.nameAr}
                                </p>
                                {item.selectedVariants &&
                                  Object.keys(item.selectedVariants).length > 0 && (
                                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-faint)' }}>
                                      {Object.entries(item.selectedVariants)
                                        .map(([k, v]) => `${k}: ${v}`)
                                        .join(', ')}
                                    </p>
                                  )}
                              </div>
                              <button
                                onClick={() => removeItem(item.product._id, item.selectedVariants)}
                                className="flex-shrink-0 transition-colors"
                                style={{ color: 'var(--text-faint)' }}
                              >
                                <Trash2 size={14} strokeWidth={1.5} />
                              </button>
                            </div>

                            <div className="flex items-center justify-between mt-3">
                              {/* Quantity */}
                              <div
                                className="flex items-center border"
                                style={{ borderColor: 'var(--border-strong)' }}
                              >
                                <button
                                  onClick={() =>
                                    updateQuantity(item.product._id, item.quantity - 1, item.selectedVariants)
                                  }
                                  className="w-7 h-7 flex items-center justify-center transition-colors"
                                  style={{ color: 'var(--text-muted)' }}
                                >
                                  <Minus size={11} strokeWidth={1.5} />
                                </button>
                                <span className="w-8 text-center text-sm" style={{ color: 'var(--text)' }}>
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    updateQuantity(item.product._id, item.quantity + 1, item.selectedVariants)
                                  }
                                  disabled={item.quantity >= item.product.stock}
                                  className="w-7 h-7 flex items-center justify-center transition-colors disabled:opacity-30"
                                  style={{ color: 'var(--text-muted)' }}
                                >
                                  <Plus size={11} strokeWidth={1.5} />
                                </button>
                              </div>

                              {/* Price */}
                              <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                                {(item.product.price * item.quantity).toLocaleString('ar-EG')} ج.م
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Upsell */}
            {items.length > 0 && upsell.length > 0 && (
              <div className="px-4 pb-3 border-t" style={{ borderColor: 'var(--border-strong)' }}>
                <p className="font-arabic text-xs font-semibold pt-3 mb-2" style={{ color: 'var(--text-faint)' }}>
                  قد يعجبك أيضاً
                </p>
                <div className="space-y-2">
                  {upsell.map((p) => (
                    <div key={p._id} className="flex items-center gap-3 p-2 border" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border-strong)' }}>
                      <div className="relative w-12 h-12 flex-shrink-0 overflow-hidden" style={{ backgroundColor: 'var(--surface-alt)' }}>
                        <Image src={p.images?.[0] || ''} alt={p.nameAr} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-arabic text-xs line-clamp-1" style={{ color: 'var(--text)' }}>{p.nameAr}</p>
                        <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--pink)' }}>{p.price.toLocaleString('ar-EG')} ج.م</p>
                      </div>
                      <button
                        onClick={() => { addItem(p, 1, {}); }}
                        className="text-xs px-2 py-1 border transition-colors flex-shrink-0"
                        style={{ borderColor: 'var(--pink)', color: 'var(--pink)' }}
                      >
                        + أضف
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            {items.length > 0 && (
              <div
                className="border-t p-5 space-y-4"
                style={{ borderColor: 'var(--border-strong)' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                    <p className="font-arabic text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>المجموع الفرعي</p>
                  </div>
                  <span className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
                    {subtotal.toLocaleString('ar-EG')} ج.م
                  </span>
                </div>

                <p className="text-xs text-center" style={{ color: 'var(--text-faint)' }}>
                  Shipping calculated at checkout
                </p>

                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <span className="font-arabic">إتمام الطلب</span>
                  <ArrowRight size={15} strokeWidth={1.5} />
                </Link>

                <button
                  onClick={closeCart}
                  className="w-full text-center text-xs tracking-wider uppercase py-1 transition-colors"
                  style={{ color: 'var(--text-faint)' }}
                >
                  Continue shopping
                </button>
              </div>
            )}

            {items.length === 0 && (
              <div className="p-5 border-t" style={{ borderColor: 'var(--border-strong)' }}>
                <Link href="/products" onClick={closeCart} className="btn-primary w-full block text-center">
                  Start Shopping
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
