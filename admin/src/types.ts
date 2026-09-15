export const CATEGORIES = [
  'Majice',
  'Košulje',
  'Hlače',
  'Haljine',
  'Jakne',
  'Džemperi',
  'Obuća',
  'Dodaci',
] as const;

export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;

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
  updatedAt: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export type OrderStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'preparing'
  | 'delivered'
  | 'picked_up';

/** Statusi koje administrator smije postaviti, redom kroz proces. */
export const SETTABLE_STATUSES: OrderStatus[] = [
  'confirmed',
  'preparing',
  'delivered',
  'picked_up',
];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: 'Čeka plaćanje',
  confirmed: 'Potvrđeno',
  preparing: 'U pripremi',
  delivered: 'Isporučeno',
  picked_up: 'Preuzeto',
};

/** Boje bedževa po statusu (Tailwind klase). */
export const STATUS_STYLES: Record<OrderStatus, string> = {
  pending_payment: 'bg-amber-50 text-amber-700 ring-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 ring-blue-200',
  preparing: 'bg-violet-50 text-violet-700 ring-violet-200',
  delivered: 'bg-cyan-50 text-cyan-700 ring-cyan-200',
  picked_up: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
};

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
  user: { _id: string; name: string; email: string } | string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  statusHistory: { status: OrderStatus; at: string }[];
  paymentStatus: 'unpaid' | 'paid';
  paymentProvider: 'stripe' | 'demo';
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

export interface Stats {
  products: number;
  activeProducts: number;
  customers: number;
  orders: number;
  paidOrders: number;
  revenue: number;
  byStatus: Partial<Record<OrderStatus, number>>;
  recentOrders: Order[];
  lowStock: { _id: string; name: string; stock: number; coverImage: string }[];
}
