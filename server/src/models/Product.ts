import mongoose, { Schema, InferSchemaType, HydratedDocument } from 'mongoose';

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

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, default: null },
    coverImage: { type: String, required: true },
    images: { type: [String], default: [] },
    category: { type: String, enum: CATEGORIES, required: true, index: true },
    sizes: { type: [String], default: ['S', 'M', 'L'] },
    colors: { type: [String], default: [] },
    stock: { type: Number, default: 0, min: 0 },
    featured: { type: Boolean, default: false, index: true },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

productSchema.index({ name: 'text', description: 'text' });

export type ProductDoc = HydratedDocument<
  InferSchemaType<typeof productSchema> & { createdAt: Date; updatedAt: Date }
>;

export const Product = mongoose.model('Product', productSchema);
