import express, { Router } from 'express';
import type Stripe from 'stripe';
import { env, stripeEnabled } from '../config/env.js';
import { markOrderPaid, paymentIntentId, stripe } from '../services/stripe.js';

const router = Router();

/**
 * POST /api/stripe/webhook — Stripe potvrda plaćanja.
 * Mora primiti *sirovo* tijelo zahtjeva zbog provjere potpisa, pa se
 * registrira prije globalnog express.json() parsera.
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripeEnabled || !stripe) return res.status(503).json({ message: 'Stripe nije konfiguriran.' });

  // Potpis je obavezan: bez njega bi bilo tko mogao poslati lažni događaj
  // i označiti narudžbu plaćenom. Bez tajne se webhook jednostavno ne koristi —
  // plaćanje se i dalje potvrđuje pri povratku kupca (`/api/orders/:id/confirm`).
  if (!env.STRIPE_WEBHOOK_SECRET) {
    console.warn('[stripe] STRIPE_WEBHOOK_SECRET nije postavljen — webhook je odbijen.');
    return res.status(503).json({ message: 'Webhook nije konfiguriran.' });
  }

  const signature = req.headers['stripe-signature'];
  if (typeof signature !== 'string') {
    return res.status(400).json({ message: 'Nedostaje potpis.' });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[stripe] neispravan webhook potpis', err);
    return res.status(400).json({ message: 'Neispravan potpis.' });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    if (orderId && session.payment_status === 'paid') {
      await markOrderPaid(orderId, 'stripe', paymentIntentId(session));
      console.log(`[stripe] narudžba ${orderId} označena plaćenom`);
    }
  }

  res.json({ received: true });
});

export default router;
