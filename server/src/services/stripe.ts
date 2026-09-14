import Stripe from 'stripe';
import { env, stripeEnabled } from '../config/env.js';
import { Order, type OrderDoc } from '../models/Order.js';
import { Product } from '../models/Product.js';

// Kratak timeout i jedan ponovni pokušaj — bez toga zahtjev bez mreže visi
// desetak sekundi po pokušaju, a kupac gleda beskonačni „Priprema plaćanja…”.
export const stripe = stripeEnabled
  ? new Stripe(env.STRIPE_SECRET_KEY, { timeout: 8000, maxNetworkRetries: 1 })
  : null;

/** Ukupni rok za jedan poziv prema Stripeu, uključujući razrješavanje imena. */
const STRIPE_DEADLINE_MS = 12_000;

class StripeUnavailableError extends Error {
  constructor(message = 'Stripe nije odgovorio na vrijeme.') {
    super(message);
    this.name = 'StripeUnavailableError';
  }
}

/**
 * Poziva Stripe s vlastitim rokom. SDK-ov `timeout` mjeri samo HTTP zahtjev —
 * kad DNS ne radi, `getaddrinfo` visi i po pola minute prije nego SDK uopće krene.
 */
async function callStripe<T>(operation: () => Promise<T>): Promise<T> {
  let timer: NodeJS.Timeout;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new StripeUnavailableError()), STRIPE_DEADLINE_MS);
  });

  try {
    return await Promise.race([operation(), deadline]);
  } finally {
    clearTimeout(timer!);
  }
}

/** Stripe nije dostupan (nema mreže, DNS ne radi, Stripe je pao). */
export const isConnectionError = (err: unknown) =>
  err instanceof StripeUnavailableError ||
  err instanceof Stripe.errors.StripeConnectionError ||
  err instanceof Stripe.errors.StripeAPIError;

/** Dohvaća Checkout sesiju uz isti rok kao i ostali pozivi prema Stripeu. */
export async function retrieveCheckoutSession(sessionId: string) {
  if (!stripe) throw new Error('Stripe nije konfiguriran.');
  return callStripe(() => stripe.checkout.sessions.retrieve(sessionId));
}

/** Iznos u najmanjoj jedinici valute (centima) — Stripe ne prima decimale. */
export const toMinorUnits = (amount: number) => Math.round(amount * 100);

/** Kreira Stripe Checkout sesiju za narudžbu i vraća URL za preusmjeravanje. */
export async function createCheckoutSession(order: OrderDoc, customerEmail?: string) {
  if (!stripe) throw new Error('Stripe nije konfiguriran.');

  const session = await callStripe(() =>
    stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: customerEmail,
      locale: 'hr',
      // Sesija vrijedi 30 minuta; nakon toga kupac mora ponovno pokrenuti naplatu.
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
      line_items: [
        ...order.items.map((item) => ({
          quantity: item.quantity,
          price_data: {
            currency: order.currency,
            unit_amount: toMinorUnits(item.price),
            product_data: {
              name: item.size ? `${item.name} (${item.size})` : item.name,
              images: item.image.startsWith('http') ? [item.image] : [],
            },
          },
        })),
        ...(order.shipping > 0
          ? [
              {
                quantity: 1,
                price_data: {
                  currency: order.currency,
                  unit_amount: toMinorUnits(order.shipping),
                  product_data: { name: 'Dostava' },
                },
              },
            ]
          : []),
      ],
      metadata: { orderId: String(order._id), orderNumber: order.orderNumber },
      success_url: `${env.CLIENT_URL}/narudzba/uspjeh?order=${order._id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.CLIENT_URL}/kosarica?otkazano=1`,
    }),
  );

  return session;
}

/**
 * Provjerava da naplaćena sesija stvarno pripada narudžbi i da je naplaćen
 * točan iznos — da izmjena `session_id` u URL-u ne može potvrditi tuđe plaćanje.
 */
export function sessionMatchesOrder(session: Stripe.Checkout.Session, order: OrderDoc) {
  return (
    session.metadata?.orderId === String(order._id) &&
    session.amount_total === toMinorUnits(order.total) &&
    session.currency === order.currency
  );
}

/** ID naplate (payment intent) iz sesije — koristi se za povrat novca u Stripe nadzornoj ploči. */
export const paymentIntentId = (session: Stripe.Checkout.Session) =>
  typeof session.payment_intent === 'string' ? session.payment_intent : (session.payment_intent?.id ?? '');

/**
 * Označava narudžbu plaćenom i potvrđenom te umanjuje zalihe.
 * Idempotentno — ponovni poziv (npr. webhook + povratak s Stripea) ne mijenja ništa.
 */
export async function markOrderPaid(
  orderId: string,
  provider: 'stripe' | 'demo' = 'stripe',
  paymentIntent = '',
) {
  const order = await Order.findById(orderId);
  if (!order) return null;
  if (order.paymentStatus === 'paid') return order;

  order.paymentStatus = 'paid';
  order.paymentProvider = provider;
  if (paymentIntent) order.stripePaymentIntentId = paymentIntent;
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
