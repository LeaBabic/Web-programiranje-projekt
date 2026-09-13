export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  coverImage: string;
  images: string[];
  category: string;
  sizes: string[];
  colors: string[];
  stock: number;
  featured: boolean;
  active: boolean;
  createdAt: string;
}

export interface ProductList {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface Category {
  name: string;
  count: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  phone?: string;
  address?: Address;
}

export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export type OrderStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'preparing'
  | 'delivered'
  | 'picked_up';

export interface OrderItem {
  product: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  size: string;
  quantity: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  currency: string;
  status: OrderStatus;
  statusHistory: { status: OrderStatus; at: string }[];
  paymentStatus: 'unpaid' | 'paid';
  shippingAddress: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  note: string;
  createdAt: string;
}

/** Redoslijed i oznake statusa narudžbe, koriste se u profilu kupca. */
export const STATUS_STEPS: OrderStatus[] = ['confirmed', 'preparing', 'delivered', 'picked_up'];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: 'Čeka plaćanje',
  confirmed: 'Potvrđeno',
  preparing: 'U pripremi',
  delivered: 'Isporučeno',
  picked_up: 'Preuzeto',
};
