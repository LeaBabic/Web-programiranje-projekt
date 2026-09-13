import { Router } from 'express';
import { z } from 'zod';
import { env } from '../config/env.js';
import { requireAdmin, requireAuth, type AuthRequest } from '../middleware/auth.js';
import {
  ADMIN_SETTABLE_STATUSES,
  generateOrderNumber,
  Order,
  ORDER_STATUSES,
} from '../models/Order.js';
import { Product } from '../models/Product.js';
import { asyncHandler, HttpError } from '../utils/http.js';

const router = Router();

/** Besplatna dostava iznad ovog iznosa. */
const FREE_SHIPPING_THRESHOLD = 80;
const SHIPPING_COST = 4.9;

const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.coerce.number().int().min(1).max(20),
        size: z.string().trim().default(''),
      }),
    )
    .min(1, 'Košarica je prazna.'),
  shippingAddress: z.object({
    fullName: z.string().trim().min(2, 'Unesite ime i prezime.'),
    phone: z.string().trim().default(''),
    street: z.string().trim().min(2, 'Unesite adresu.'),
    city: z.string().trim().min(2, 'Unesite grad.'),
    postalCode: z.string().trim().min(2, 'Unesite poštanski broj.'),
    country: z.string().trim().default('Hrvatska'),
  }),
  note: z.string().trim().max(500).default(''),
});

const round = (n: number) => Math.round(n * 100) / 100;

/**
 * Označava narudžbu plaćenom i potvrđenom te umanjuje zalihe.
 * Idempotentno — ponovni poziv ne mijenja ništa.
 */
async function markOrderPaid(orderId: string) {
  const order = await Order.findById(orderId);
  if (!order) return null;
  if (order.paymentStatus === 'paid') return order;

  order.paymentStatus = 'paid';
  order.status = 'confirmed';
  order.statusHistory.push({ status: 'confirmed', at: new Date() });
  await order.save();

  await Promise.all(
    order.items.map((item) =>
      Product.updateOne({ _id: item.product }, { $inc: { stock: -item.quantity } }),
    ),
  );

  return order;
}

/** POST /api/orders — stvara narudžbu iz košarice. */
router.post(
  '/',
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const data = createOrderSchema.parse(req.body);

    const products = await Product.find({
      _id: { $in: data.items.map((i) => i.productId) },
      active: true,
    });
    const byId = new Map(products.map((p) => [String(p._id), p]));

    // Cijene se uvijek računaju na poslužitelju — klijentu se ne vjeruje.
    const items = data.items.map((item) => {
      const product = byId.get(item.productId);
      if (!product) throw new HttpError(400, `Proizvod nije dostupan (${item.productId}).`);
      if (product.stock < item.quantity) {
        throw new HttpError(409, `Nema dovoljno zaliha za "${product.name}".`);
      }
      return {
        product: product._id,
        name: product.name,
        slug: product.slug,
        image: product.coverImage,
        price: product.price,
        size: item.size,
        quantity: item.quantity,
      };
    });

    const subtotal = round(items.reduce((sum, i) => sum + i.price * i.quantity, 0));
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;

    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      user: req.user!._id,
      items,
      subtotal,
      shipping,
      total: round(subtotal + shipping),
      currency: env.CURRENCY,
      status: 'pending_payment',
      statusHistory: [{ status: 'pending_payment', at: new Date() }],
      shippingAddress: data.shippingAddress,
      note: data.note,
    });

    res.status(201).json({
      orderId: String(order._id),
      checkoutUrl: `${env.CLIENT_URL}/narudzba/uspjeh?order=${order._id}`,
    });
  }),
);

/** GET /api/orders/mine — narudžbe prijavljenog korisnika. */
router.get(
  '/mine',
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const orders = await Order.find({ user: req.user!._id }).sort({ createdAt: -1 }).lean();
    res.json(orders);
  }),
);

/**
 * POST /api/orders/:id/confirm — potvrda plaćanja.
 * Zasad se plaćanje simulira; naplata karticom dolazi u sljedećem koraku.
 */
router.post(
  '/:id/confirm',
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) throw new HttpError(404, 'Narudžba nije pronađena.');
    if (String(order.user) !== String(req.user!._id) && req.user!.role !== 'admin') {
      throw new HttpError(403, 'Nemate pristup ovoj narudžbi.');
    }

    if (order.paymentStatus === 'paid') return res.json(order);

    const updated = await markOrderPaid(String(order._id));
    res.json(updated);
  }),
);

/** GET /api/orders — admin popis svih narudžbi. */
router.get(
  '/',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const q = z
      .object({
        status: z.enum(ORDER_STATUSES).optional(),
        search: z.string().trim().optional(),
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),
      })
      .parse(req.query);

    const filter: Record<string, unknown> = {};
    if (q.status) filter.status = q.status;
    if (q.search) {
      filter.$or = [
        { orderNumber: { $regex: q.search, $options: 'i' } },
        { 'shippingAddress.fullName': { $regex: q.search, $options: 'i' } },
        { 'shippingAddress.city': { $regex: q.search, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      Order.find(filter)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip((q.page - 1) * q.limit)
        .limit(q.limit)
        .lean(),
      Order.countDocuments(filter),
    ]);

    res.json({ items, total, page: q.page, pages: Math.max(1, Math.ceil(total / q.limit)) });
  }),
);

/** GET /api/orders/:id — vlasnik ili admin. */
router.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email').lean();
    if (!order) throw new HttpError(404, 'Narudžba nije pronađena.');

    const ownerId = String((order.user as { _id?: unknown })?._id ?? order.user);
    if (ownerId !== String(req.user!._id) && req.user!.role !== 'admin') {
      throw new HttpError(403, 'Nemate pristup ovoj narudžbi.');
    }

    res.json(order);
  }),
);

/** PATCH /api/orders/:id/status — admin mijenja status narudžbe. */
router.patch(
  '/:id/status',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { status } = z.object({ status: z.enum(ADMIN_SETTABLE_STATUSES) }).parse(req.body);

    const order = await Order.findById(req.params.id);
    if (!order) throw new HttpError(404, 'Narudžba nije pronađena.');

    order.status = status;
    order.statusHistory.push({ status, at: new Date() });
    await order.save();

    res.json(order);
  }),
);

export default router;
