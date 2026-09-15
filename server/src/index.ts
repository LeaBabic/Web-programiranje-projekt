import cors from 'cors';
import express from 'express';
import { connectDb } from './config/db.js';
import { env, stripeEnabled } from './config/env.js';
import { errorHandler, notFound } from './middleware/error.js';
import { UPLOAD_DIR } from './middleware/upload.js';
import authRoutes from './routes/auth.routes.js';
import orderRoutes from './routes/order.routes.js';
import productRoutes from './routes/product.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import webhookRoutes from './routes/webhook.routes.js';

const app = express();

app.use(
  cors({
    origin: [env.CLIENT_URL, env.ADMIN_URL],
    credentials: true,
  }),
);

// Webhook mora doći prije JSON parsera (treba sirovo tijelo zahtjeva).
app.use('/api/stripe', webhookRoutes);

app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '7d' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', stripe: stripeEnabled ? 'live' : 'demo' });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/uploads', uploadRoutes);

app.use(notFound);
app.use(errorHandler);

connectDb()
  .then(() => {
    app.listen(env.PORT, () => {
      console.log(`[api] sluša na ${env.SERVER_URL}`);
      console.log(`[api] plaćanje: ${stripeEnabled ? 'Stripe' : 'DEMO (bez Stripe ključa)'}`);
    });
  })
  .catch((err) => {
    console.error('[db] spajanje nije uspjelo:', err);
    process.exit(1);
  });
