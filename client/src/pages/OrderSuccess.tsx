import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, CheckIcon, SpinnerIcon } from '../components/Icons';
import ProductImage from '../components/ProductImage';
import { Alert, EmptyState } from '../components/ui';
import { api, ApiError } from '../lib/api';
import { formatPrice } from '../lib/format';
import { useCart } from '../store/cart';
import { STATUS_LABELS, type Order } from '../types';

export default function OrderSuccess() {
  const [params] = useSearchParams();
  const orderId = params.get('order');
  const clearCart = useCart((s) => s.clear);

  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const confirmed = useRef(false);

  useEffect(() => {
    if (!orderId || confirmed.current) return;
    confirmed.current = true;

    // Potvrda plaćanja odmah nakon povratka — narudžba prelazi u „Potvrđeno”.
    api<Order>(`/api/orders/${orderId}/confirm`, { method: 'POST', auth: true })
      .then((data) => {
        setOrder(data);
        clearCart();
      })
      .catch(async (err) => {
        // Ako je webhook već obradio plaćanje, dovoljno je dohvatiti narudžbu.
        try {
          const existing = await api<Order>(`/api/orders/${orderId}`, { auth: true });
          setOrder(existing);
          if (existing.paymentStatus === 'paid') clearCart();
          else setError(err instanceof ApiError ? err.message : 'Plaćanje nije potvrđeno.');
        } catch {
          setError(err instanceof ApiError ? err.message : 'Narudžba nije pronađena.');
        }
      });
  }, [orderId, clearCart]);

  if (!orderId) {
    return (
      <div className="container-page py-16">
        <EmptyState
          title="Nedostaje broj narudžbe"
          description="Poveznica nije potpuna. Sve svoje narudžbe možete vidjeti u profilu."
          actionLabel="Moj profil"
          actionTo="/profil"
        />
      </div>
    );
  }

  if (!order && !error) {
    return (
      <div className="container-page flex flex-col items-center justify-center gap-4 py-32 text-muted">
        <SpinnerIcon className="h-8 w-8" />
        <p className="text-sm">Potvrđujemo vaše plaćanje…</p>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="container-page py-16">
        <EmptyState
          title="Plaćanje nije potvrđeno"
          description={error}
          actionLabel="Natrag u košaricu"
          actionTo="/kosarica"
        />
      </div>
    );
  }

  return (
    <div className="container-page py-12 lg:py-16">
      <div className="animate-fade-up mx-auto max-w-2xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sage/15 text-sage">
          <CheckIcon className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-3xl sm:text-4xl">Hvala na narudžbi!</h1>
        <p className="mt-3 text-ink-soft">
          Potvrdu smo poslali na vašu e-mail adresu. Narudžbu možete pratiti u svom profilu.
        </p>
      </div>

      {error && (
        <div className="mx-auto mt-6 max-w-2xl">
          <Alert variant="info">{error}</Alert>
        </div>
      )}

      {order && (
        <div className="card animate-fade-up mx-auto mt-8 max-w-2xl overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-sand px-6 py-4">
            <div>
              <p className="text-xs text-muted">Broj narudžbe</p>
              <p className="font-medium">{order.orderNumber}</p>
            </div>
            <span className="rounded-full bg-ink px-3 py-1.5 text-xs font-medium text-cream">
              {STATUS_LABELS[order.status]}
            </span>
          </div>

          <ul className="divide-y divide-line px-6">
            {order.items.map((item, i) => (
              <li key={i} className="flex items-center gap-4 py-4">
                <div className="h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-sand">
                  <ProductImage src={item.image} alt={item.name} className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted">
                    {item.size && `Veličina: ${item.size} · `}Količina: {item.quantity}
                  </p>
                </div>
                <p className="text-sm">{formatPrice(item.price * item.quantity)}</p>
              </li>
            ))}
          </ul>

          <dl className="space-y-2 border-t border-line px-6 py-5 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-soft">Međuzbroj</dt>
              <dd>{formatPrice(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-soft">Dostava</dt>
              <dd>{order.shipping === 0 ? 'Besplatno' : formatPrice(order.shipping)}</dd>
            </div>
            <div className="flex justify-between pt-2 text-base font-medium">
              <dt>Ukupno plaćeno</dt>
              <dd>{formatPrice(order.total)}</dd>
            </div>
          </dl>

          <div className="border-t border-line px-6 py-5 text-sm text-ink-soft">
            <p className="text-xs tracking-wide text-muted uppercase">Dostava na adresu</p>
            <p className="mt-1.5">
              {order.shippingAddress.fullName}, {order.shippingAddress.street},{' '}
              {order.shippingAddress.postalCode} {order.shippingAddress.city},{' '}
              {order.shippingAddress.country}
            </p>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/profil" className="btn-primary">
          Prati narudžbu
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link to="/trgovina" className="btn-secondary">
          Nastavi kupovinu
        </Link>
      </div>
    </div>
  );
}
