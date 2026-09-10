import 'dotenv/config';

export const env = {
  PORT: Number(process.env.PORT ?? 4000),
  MONGODB_URI: process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/web-trgovina',
  JWT_SECRET: process.env.JWT_SECRET ?? 'dev-secret-promijeni-me',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '7d',
  CLIENT_URL: process.env.CLIENT_URL ?? 'http://localhost:5173',
  ADMIN_URL: process.env.ADMIN_URL ?? 'http://localhost:5174',
  SERVER_URL: process.env.SERVER_URL ?? 'http://localhost:4000',
};
