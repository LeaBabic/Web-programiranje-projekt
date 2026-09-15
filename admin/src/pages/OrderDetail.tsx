import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckIcon, ChevronLeft, SpinnerIcon } from '../components/Icons';
import { Alert, Loading, StatusBadge, Thumb } from '../components/ui';
import { api, ApiError } from '../lib/api';
import { formatDateTime, formatPrice } from '../lib/format';
import { useApi } from '../lib/hooks';
import { SETTABLE_STATUSES, STATUS_LABELS, type Order, type OrderStatus } from '../types';

export default function OrderDetail() {
  const { id } = useParams();
  const order = useApi<Order>(id ? `/api/orders/${id}` : null);
  const [saving, setSaving] = useState<OrderStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const setStatus = async (status: OrderStatus) => {
    if (!order.data) return;
    setSaving(status);
    setError(null);
    try {
      const updated = await api<Order>(`/api/orders/${order.data._id}/status`, {
        method: 'PATCH',
        body: { status },
      });
      order.setData({
        ...order.data,
        status: updated.status,
        statusHistory: updated.statusHistory,
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Promjena statusa nije uspjela.');
    } finally {
      setSaving(null);
    }
  };

  if (order.loading) return <Loading label="Učitavanje narudžbe…" />;
  if (order.error) return <Alert>{order.error}</Alert>;
  if (!order.data) return null;

  const data = order.data;
  const customer = typeof data.user === 'object' ? data.user : null;
  const currentIndex = SETTABLE_STATUSES.indexOf(data.status);

  return (
    <>
      <Link
        to="/narudzbe"
        className="mb-4 inline-flex items-center gap-1 text-sm text-ink-soft hover:text-ink"
      >
        <ChevronLeft className="h-4 w-4" />
        Natrag na narudžbe
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{data.orderNumber}</h1>
          <p className="mt-1 text-sm text-ink-soft">Zaprimljeno {formatDateTime(data.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-xs ring-1 ring-inset ${
              data.paymentStatus === 'paid'
                ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                : 'bg-amber-50 text-amber-700 ring-amber-200'
            }`}
          >
            {data.paymentStatus === 'paid' ? 'Plaćeno' : 'Neplaćeno'}
            {data.paymentProvider === 'demo' && ' (demo)'}
          </span>
          <StatusBadge status={data.status} />
        </div>
      </div>

      {error && (
        <div className="mt-4">
          <Alert>{error}</Alert>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {/* Promjena statusa */}
          <section className="card p-5">
            <h2 className="text-sm font-semibold">Status narudžbe</h2>
            {data.status === 'pending_payment' ? (
              <p className="mt-3 text-sm text-ink-soft">
                Plaćanje još nije dovršeno, pa status obrade nije moguće mijenjati.
              </p>
            ) : (
              <>
                <p className="mt-1 text-xs text-muted">
                  Kupac promjenu vidi odmah na stranici svog profila.
                </p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {SETTABLE_STATUSES.map((status, i) => {
                    const active = data.status === status;
                    const done = i < currentIndex;
                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setStatus(status)}
                        disabled={saving !== null || active}
                        className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors disabled:cursor-default ${
                          active
                            ? 'border-brand bg-brand text-white'
                            : done
                              ? 'border-line bg-canvas text-ink-soft'
                              : 'border-line bg-panel text-ink-soft hover:border-brand hover:text-brand'
                        }`}
                      >
                        {saving === status ? (
                          <SpinnerIcon className="h-4 w-4" />
                        ) : (
                          (active || done) && <CheckIcon className="h-4 w-4" />
                        )}
                        {STATUS_LABELS[status]}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {data.statusHistory.length > 0 && (
              <ol className="mt-5 space-y-2 border-t border-line pt-4">
                {[...data.statusHistory].reverse().map((entry, i) => (
                  <li key={i} className="flex items-center justify-between text-xs">
                    <span className="text-ink-soft">{STATUS_LABELS[entry.status]}</span>
                    <span className="text-muted">{formatDateTime(entry.at)}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>

          {/* Artikli */}
          <section className="card overflow-hidden">
            <h2 className="border-b border-line px-5 py-4 text-sm font-semibold">
              Artikli ({data.items.reduce((n, i) => n + i.quantity, 0)} kom.)
            </h2>
            <ul className="divide-y divide-line">
              {data.items.map((item, i) => (
                <li key={i} className="flex items-center gap-4 px-5 py-4">
                  <Thumb src={item.image} alt={item.name} className="h-16 w-13" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted">
                      {item.size && `Veličina: ${item.size} · `}
                      {formatPrice(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</p>
                </li>
              ))}
            </ul>
            <dl className="space-y-2 border-t border-line px-5 py-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-soft">Međuzbroj</dt>
                <dd>{formatPrice(data.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">Dostava</dt>
                <dd>{data.shipping === 0 ? 'Besplatno' : formatPrice(data.shipping)}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-2 font-semibold">
                <dt>Ukupno</dt>
                <dd>{formatPrice(data.total)}</dd>
              </div>
            </dl>
          </section>
        </div>

        {/* Podaci o kupcu */}
        <aside className="space-y-6">
          <section className="card p-5">
            <h2 className="text-sm font-semibold">Kupac</h2>
            <div className="mt-3 space-y-1 text-sm">
              <p className="font-medium">{customer?.name ?? data.shippingAddress.fullName}</p>
              {customer && <p className="text-ink-soft">{customer.email}</p>}
              {data.shippingAddress.phone && (
                <p className="text-ink-soft">{data.shippingAddress.phone}</p>
              )}
            </div>
          </section>

          <section className="card p-5">
            <h2 className="text-sm font-semibold">Adresa dostave</h2>
            <address className="mt-3 text-sm leading-relaxed text-ink-soft not-italic">
              {data.shippingAddress.fullName}
              <br />
              {data.shippingAddress.street}
              <br />
              {data.shippingAddress.postalCode} {data.shippingAddress.city}
              <br />
              {data.shippingAddress.country}
            </address>
          </section>

          {data.note && (
            <section className="card p-5">
              <h2 className="text-sm font-semibold">Napomena kupca</h2>
              <p className="mt-2 text-sm text-ink-soft">{data.note}</p>
            </section>
          )}
        </aside>
      </div>
    </>
  );
}
