'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ICartItem, IProduct } from '@/types';

// Helper: generate a unique key per item including variants
function itemKey(productId: string, variants?: Record<string, string>): string {
  if (!variants || Object.keys(variants).length === 0) return productId;
  const sortedVariants = Object.keys(variants)
    .sort()
    .map((k) => `${k}:${variants[k]}`)
    .join('|');
  return `${productId}__${sortedVariants}`;
}

interface CartStore {
  items: ICartItem[];
  isOpen: boolean;
  addItem: (product: IProduct, quantity: number, variants?: Record<string, string>) => void;
  removeItem: (productId: string, variants?: Record<string, string>) => void;
  updateQuantity: (productId: string, quantity: number, variants?: Record<string, string>) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  subtotal: number;
  itemCount: number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, quantity, variants) => {
        set((state) => {
          const key = itemKey(product._id, variants);
          const existing = state.items.find(
            (i) => itemKey(i.product._id, i.selectedVariants) === key
          );

          if (existing) {
            return {
              items: state.items.map((i) =>
                itemKey(i.product._id, i.selectedVariants) === key
                  ? { ...i, quantity: Math.min(i.quantity + quantity, i.product.stock) }
                  : i
              ),
            };
          }

          return {
            items: [
              ...state.items,
              { productId: product._id, product, quantity: Math.min(quantity, product.stock), selectedVariants: variants, price: product.price },
            ],
          };
        });
      },

      removeItem: (productId, variants) => {
        set((state) => ({
          items: state.items.filter(
            (i) => itemKey(i.product._id, i.selectedVariants) !== itemKey(productId, variants)
          ),
        }));
      },

      updateQuantity: (productId, quantity, variants) => {
        const safeQty = Math.floor(quantity);
        if (!Number.isFinite(safeQty) || safeQty < 1) {
          get().removeItem(productId, variants);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            itemKey(i.product._id, i.selectedVariants) === itemKey(productId, variants)
              ? { ...i, quantity: Math.min(safeQty, i.product.stock) }
              : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      openCart: () => set({ isOpen: true }),

      closeCart: () => set({ isOpen: false }),

      get subtotal() {
        return get().items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );
      },

      get itemCount() {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'accessory-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);

// Selector hooks for performance
export const useCart = () => useCartStore();
export const useCartItems = () => useCartStore((s) => s.items);
export const useCartCount = () =>
  useCartStore((s) => s.items.reduce((sum, item) => sum + item.quantity, 0));
export const useCartSubtotal = () =>
  useCartStore((s) =>
    s.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  );
export const useCartIsOpen = () => useCartStore((s) => s.isOpen);
