import { Router } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { attachUser, requireAdmin, type AuthRequest } from '../middleware/auth.js';
import { CATEGORIES, Product } from '../models/Product.js';
import { asyncHandler, HttpError } from '../utils/http.js';
import { uniqueSlug } from '../utils/slug.js';

const router = Router();

const listQuerySchema = z.object({
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  size: z.string().trim().optional(),
  featured: z.enum(['true', 'false']).optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc', 'name_asc']).default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(60).default(12),
  /** Admin popis prikazuje i deaktivirane proizvode. */
  includeInactive: z.enum(['true', 'false']).optional(),
});

const productSchema = z.object({
  name: z.string().trim().min(2, 'Naziv mora imati barem 2 znaka.'),
  description: z.string().trim().min(10, 'Opis mora imati barem 10 znakova.'),
  price: z.coerce.number().min(0, 'Cijena ne može biti negativna.'),
  compareAtPrice: z.coerce.number().min(0).nullable().optional(),
  coverImage: z.string().trim().min(1, 'Naslovna slika je obavezna.'),
  images: z.array(z.string().trim().min(1)).default([]),
  category: z.enum(CATEGORIES),
  sizes: z.array(z.string().trim()).default([]),
  colors: z.array(z.string().trim()).default([]),
  stock: z.coerce.number().int().min(0).default(0),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
});

const SORTS: Record<string, Record<string, 1 | -1>> = {
  newest: { createdAt: -1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  name_asc: { name: 1 },
};

/** GET /api/products — javni popis s filtrima i paginacijom. */
router.get(
  '/',
  attachUser,
  asyncHandler(async (req: AuthRequest, res) => {
    const q = listQuerySchema.parse(req.query);
    const filter: Record<string, unknown> = {};

    // Neaktivne proizvode smije vidjeti samo admin panel (uz ispravan token).
    const showInactive = q.includeInactive === 'true' && req.user?.role === 'admin';
    if (!showInactive) filter.active = true;
    if (q.category) filter.category = q.category;
    if (q.featured) filter.featured = q.featured === 'true';
    if (q.size) filter.sizes = q.size;
    if (q.search) filter.name = { $regex: q.search, $options: 'i' };
    if (q.minPrice !== undefined || q.maxPrice !== undefined) {
      filter.price = {
        ...(q.minPrice !== undefined ? { $gte: q.minPrice } : {}),
        ...(q.maxPrice !== undefined ? { $lte: q.maxPrice } : {}),
      };
    }

    const [items, total] = await Promise.all([
      Product.find(filter)
        .sort(SORTS[q.sort])
        .skip((q.page - 1) * q.limit)
        .limit(q.limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    res.json({
      items,
      total,
      page: q.page,
      limit: q.limit,
      pages: Math.max(1, Math.ceil(total / q.limit)),
    });
  }),
);

/** GET /api/products/categories — kategorije s brojem aktivnih proizvoda. */
router.get(
  '/categories',
  asyncHandler(async (_req, res) => {
    const counts = await Product.aggregate<{ _id: string; count: number }>([
      { $match: { active: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);
    const map = new Map(counts.map((c) => [c._id, c.count]));
    res.json(CATEGORIES.map((name) => ({ name, count: map.get(name) ?? 0 })));
  }),
);

/** GET /api/products/:idOrSlug */
router.get(
  '/:idOrSlug',
  asyncHandler(async (req, res) => {
    const { idOrSlug } = req.params;
    const product = mongoose.isValidObjectId(idOrSlug)
      ? await Product.findById(idOrSlug).lean()
      : await Product.findOne({ slug: idOrSlug }).lean();

    if (!product) throw new HttpError(404, 'Proizvod nije pronađen.');

    const related = await Product.find({
      _id: { $ne: product._id },
      category: product.category,
      active: true,
    })
      .limit(4)
      .lean();

    res.json({ product, related });
  }),
);

/** POST /api/products — admin. */
router.post(
  '/',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const data = productSchema.parse(req.body);
    const product = await Product.create({ ...data, slug: await uniqueSlug(data.name) });
    res.status(201).json(product);
  }),
);

/** PUT /api/products/:id — admin. */
router.put(
  '/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const data = productSchema.partial().parse(req.body);
    const product = await Product.findById(req.params.id);
    if (!product) throw new HttpError(404, 'Proizvod nije pronađen.');

    if (data.name && data.name !== product.name) {
      product.slug = await uniqueSlug(data.name, String(product._id));
    }
    Object.assign(product, data);
    await product.save();

    res.json(product);
  }),
);

/** DELETE /api/products/:id — admin. */
router.delete(
  '/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) throw new HttpError(404, 'Proizvod nije pronađen.');
    res.json({ message: 'Proizvod je obrisan.', id: req.params.id });
  }),
);

export default router;
