import mongoose, { Schema, InferSchemaType, HydratedDocument } from 'mongoose';

/**
 * Statusi narudžbe. `pending_payment` je interni status dok plaćanje nije
 * dovršeno — administrator ga ne može ručno postaviti.
 */
export const ORDER_STATUSES = [
  'pending_payment',
  'confirmed',
  'preparing',
  'delivered',
  'picked_up',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** Statusi koje administrator smije postaviti. */
export const ADMIN_SETTABLE_STATUSES = [
  'confirmed',
  'preparing',
  'delivered',
  'picked_up',
] as const satisfies readonly OrderStatus[];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: 'Čeka plaćanje',
  confirmed: 'Potvrđeno',
  preparing: 'U pripremi',
  delivered: 'Isporučeno',
  picked_up: 'Preuzeto',
};

const orderItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    size: { type: String, default: '' },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const orderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    shipping: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true },
    currency: { type: String, default: 'eur' },
    status: { type: String, enum: ORDER_STATUSES, default: 'pending_payment', index: true },
    statusHistory: {
      type: [
        {
          status: { type: String, enum: ORDER_STATUSES },
          at: { type: Date, default: Date.now },
          _id: false,
        },
      ],
      default: [],
    },
    paymentStatus: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid', index: true },

    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, default: '' },
      street: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, default: 'Hrvatska' },
    },
    note: { type: String, default: '' },
  },
  { timestamps: true },
);

export type OrderDoc = HydratedDocument<
  InferSchemaType<typeof orderSchema> & { createdAt: Date; updatedAt: Date }
>;

export const Order = mongoose.model('Order', orderSchema);

/** Generira čitljiv broj narudžbe, npr. NAR-260807-4821 */
export function generateOrderNumber() {
  const d = new Date();
  const stamp = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `NAR-${stamp}-${rand}`;
}
