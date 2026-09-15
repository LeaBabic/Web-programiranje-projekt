import 'dotenv/config';

export const env = {
  PORT: Number(process.env.PORT ?? 4000),
  MONGODB_URI: process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/web-trgovina',
  JWT_SECRET: process.env.JWT_SECRET ?? 'dev-secret-promijeni-me',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '7d',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ?? '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ?? '',
  CLIENT_URL: process.env.CLIENT_URL ?? 'http://localhost:5173',
  ADMIN_URL: process.env.ADMIN_URL ?? 'http://localhost:5174',
  SERVER_URL: process.env.SERVER_URL ?? 'http://localhost:4000',
  CURRENCY: (process.env.CURRENCY ?? 'eur').toLowerCase(),
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ?? '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ?? '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ?? '',
};

/** Kada Stripe ključ nije postavljen, aplikacija radi u DEMO načinu plaćanja. */
export const stripeEnabled = env.STRIPE_SECRET_KEY.length > 0;

/**
 * Kada su Cloudinary podaci postavljeni, slike idu u oblak i preživljavaju
 * ponovni deploy. Inače se spremaju na lokalni disk (dovoljno za razvoj).
 */
export const cloudinaryEnabled =
  env.CLOUDINARY_CLOUD_NAME.length > 0 &&
  env.CLOUDINARY_API_KEY.length > 0 &&
  env.CLOUDINARY_API_SECRET.length > 0;
