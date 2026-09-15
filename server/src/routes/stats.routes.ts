import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/http.js';

const router = Router();

/** GET /api/stats — brojke za admin nadzornu ploču. */
router.get(
  '/',
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const [products, activeProducts, customers, orders, paidOrders, byStatus, revenue, recent] =
      await Promise.all([
        Product.countDocuments(),
        Product.countDocuments({ active: true }),
        User.countDocuments({ role: 'user' }),
        Order.countDocuments(),
        Order.countDocuments({ paymentStatus: 'paid' }),
        Order.aggregate<{ _id: string; count: number }>([
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
        Order.aggregate<{ _id: null; total: number }>([
          { $match: { paymentStatus: 'paid' } },
          { $group: { _id: null, total: { $sum: '$total' } } },
        ]),
        Order.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(5).lean(),
      ]);

    const lowStock = await Product.find({ active: true, stock: { $lte: 3 } })
      .select('name stock coverImage')
      .limit(5)
      .lean();

    res.json({
      products,
      activeProducts,
      customers,
      orders,
      paidOrders,
      revenue: Math.round((revenue[0]?.total ?? 0) * 100) / 100,
      byStatus: Object.fromEntries(byStatus.map((s) => [s._id, s.count])),
      recentOrders: recent,
      lowStock,
    });
  }),
);

export default router;
