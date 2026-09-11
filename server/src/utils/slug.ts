import { Product } from '../models/Product.js';

const MAP: Record<string, string> = { č: 'c', ć: 'c', đ: 'd', š: 's', ž: 'z' };
const COMBINING_MARKS = /[̀-ͯ]/g;

export function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[čćđšž]/g, (c) => MAP[c] ?? c)
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/** Vraća slug koji sigurno nije zauzet (dodaje -2, -3 ... ako treba). */
export async function uniqueSlug(name: string, ignoreId?: string) {
  const base = slugify(name) || 'proizvod';
  let slug = base;
  let i = 2;

  for (;;) {
    const existing = await Product.findOne({ slug }).select('_id').lean();
    if (!existing || (ignoreId && String(existing._id) === ignoreId)) return slug;
    slug = `${base}-${i++}`;
  }
}
