import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '../types';

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  size: string;
  quantity: number;
  stock: number;
}

interface CartState {
  items: CartItem[];
  add: (product: Product, size: string, quantity?: number) => void;
  remove: (productId: string, size: string) => void;
  setQuantity: (productId: string, size: string, quantity: number) => void;
  clear: () => void;
}

/** Isti proizvod u različitim veličinama je zasebna stavka košarice. */
const sameLine = (item: CartItem, productId: string, size: string) =>
  item.productId === productId && item.size === size;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      add: (product, size, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => sameLine(i, product._id, size));
          if (existing) {
            return {
              items: state.items.map((i) =>
                sameLine(i, product._id, size)
                  ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock || 99) }
                  : i,
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                productId: product._id,
                name: product.name,
                slug: product.slug,
                image: product.coverImage,
                price: product.price,
                size,
                quantity,
                stock: product.stock,
              },
            ],
          };
        }),

      remove: (productId, size) =>
        set((state) => ({ items: state.items.filter((i) => !sameLine(i, productId, size)) })),

      setQuantity: (productId, size, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) => (sameLine(i, productId, size) ? { ...i, quantity } : i))
            .filter((i) => i.quantity > 0),
        })),

      clear: () => set({ items: [] }),
    }),
    { name: 'atelier_cart' },
  ),
);

export const cartCount = (items: CartItem[]) => items.reduce((n, i) => n + i.quantity, 0);
export const cartSubtotal = (items: CartItem[]) =>
  Math.round(items.reduce((sum, i) => sum + i.price * i.quantity, 0) * 100) / 100;

export const FREE_SHIPPING_THRESHOLD = 80;
export const SHIPPING_COST = 4.9;
export const cartShipping = (subtotal: number) =>
  subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
