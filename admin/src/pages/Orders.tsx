import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SearchIcon } from '../components/Icons';
import { Alert, EmptyState, Loading, PageHeader, StatusBadge } from '../components/ui';
import { api, ApiError } from '../lib/api';
import { formatDateTime, formatPrice } from '../lib/format';
import { useApi } from '../lib/hooks';
import {
  SETTABLE_STATUSES,
  STATUS_LABELS,
  type Order,
  type OrderStatus,
  type Paginated,
} from '../types';

const FILTERS: { value: string; label: string }[] = [
  { value: '', label: 'Sve' },
  ...SETTABLE_STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] })),
  { value: 'pending_payment', label: STATUS_LABELS.pending_payment },
];

export default function Orders() {
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const query = useMemo(() => {
    const q = new URLSearchParams({ page: String(page), limit: '20' });
    if (status) q.set('status', status);
    if (search.trim()) q.set('search', search.trim());
    return q.toString();
  }, [status, search, page]);

  const orders = useApi<Paginated<Order>>(`/api/orders?${query}`);

  /** Brza promjena statusa izravno iz popisa. */
  const changeStatus = async (order: Order, next: OrderStatus) => {
    setUpdatingId(order._id);
    setError(null);
    try {
      const updated = await api<Order>(`/api/orders/${order._id}/status`, {
        method: 'PATCH',
        body: { status: next },
      });
      orders.setData({
        ...orders.data!,
        items: orders.data!.items.map((o) =>
          o._id === order._id ? { ...o, status: updated.status } : o,
        ),
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Promjena statusa nije uspjela.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <>
      <PageHeader title="Narudžbe" subtitle="Pregled svih narudžbi i upravljanje statusom isporuke." />

      {error && (
        <div className="mb-4">
          <Alert>{error}</Alert>
        </div>
      )}

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((filter) => (
            <button
              key={filter.value || 'all'}
              type="button"
              onClick={() => {
                setStatus(filter.value);
                setPage(1);
              }}
              className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                status === filter.value
                  ? 'bg-ink text-white'
                  : 'bg-panel text-ink-soft ring-1 ring-line ring-inset hover:text-ink'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="relative lg:w-72">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Broj narudžbe, ime ili grad…"
            aria-label="Pretraži narudžbe"
            className="input pl-9"
          />
        </div>
      </div>

      {orders.loading ? (
        <Loading />
      ) : orders.error ? (
        <Alert>{orders.error}</Alert>
      ) : (orders.data?.items.length ?? 0) === 0 ? (
        <EmptyState
          title="Nema narudžbi"
          description="Za odabrane filtre nema rezultata. Promijenite filtar ili pričekajte prvu narudžbu."
        />
      ) : (
        <>
          <div className="card overflow-hidden">
            <table className="hidden w-full text-sm lg:table">
              <thead className="border-b border-line bg-canvas text-left text-xs text-ink-soft uppercase">
                <tr>
                  <th className="px-5 py-3 font-semibold">Narudžba</th>
                  <th className="px-4 py-3 font-semibold">Kupac</th>
                  <th className="px-4 py-3 font-semibold">Artikli</th>
                  <th className="px-4 py-3 font-semibold">Iznos</th>
                  <th className="px-4 py-3 font-semibold">Plaćanje</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {orders.data!.items.map((order) => (
                  <tr key={order._id} className="transition-colors hover:bg-canvas">
                    <td className="px-5 py-3">
                      <Link
                        to={`/narudzbe/${order._id}`}
                        className="font-medium hover:text-brand"
                      >
                        {order.orderNumber}
                      </Link>
                      <p className="text-xs text-muted">{formatDateTime(order.createdAt)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-ink-soft">
                        {typeof order.user === 'object' ? order.user.name : '—'}
                      </p>
                      <p className="text-xs text-muted">{order.shippingAddress.city}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">
                      {order.items.reduce((n, i) => n + i.quantity, 0)} kom.
                    </td>
                    <td className="px-4 py-3 font-medium">{formatPrice(order.total)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ring-1 ring-inset ${
                          order.paymentStatus === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                            : 'bg-amber-50 text-amber-700 ring-amber-200'
                        }`}
                      >
                        {order.paymentStatus === 'paid' ? 'Plaćeno' : 'Neplaćeno'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {order.status === 'pending_payment' ? (
                        <StatusBadge status={order.status} />
                      ) : (
                        <select
                          value={order.status}
                          disabled={updatingId === order._id}
                          onChange={(e) => changeStatus(order, e.target.value as OrderStatus)}
                          aria-label={`Status narudžbe ${order.orderNumber}`}
                          className="input py-1.5 text-xs"
                        >
                          {SETTABLE_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {STATUS_LABELS[s]}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Kartice na užim ekranima */}
            <ul className="divide-y divide-line lg:hidden">
              {orders.data!.items.map((order) => (
                <li key={order._id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link to={`/narudzbe/${order._id}`} className="font-medium hover:text-brand">
                        {order.orderNumber}
                      </Link>
                      <p className="text-xs text-muted">{formatDateTime(order.createdAt)}</p>
                      <p className="mt-1 text-sm text-ink-soft">
                        {typeof order.user === 'object' ? order.user.name : '—'} ·{' '}
                        {order.shippingAddress.city}
                      </p>
                    </div>
                    <p className="font-medium">{formatPrice(order.total)}</p>
                  </div>

                  <div className="mt-3">
                    {order.status === 'pending_payment' ? (
                      <StatusBadge status={order.status} />
                    ) : (
                      <select
                        value={order.status}
                        disabled={updatingId === order._id}
                        onChange={(e) => changeStatus(order, e.target.value as OrderStatus)}
                        aria-label={`Status narudžbe ${order.orderNumber}`}
                        className="input py-2 text-xs"
                      >
                        {SETTABLE_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {STATUS_LABELS[s]}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm">
            <p className="text-muted">
              Ukupno {orders.data!.total} narudžbi · stranica {orders.data!.page} od{' '}
              {orders.data!.pages}
            </p>
            {orders.data!.pages > 1 && (
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="btn-secondary px-3 py-1.5 text-xs"
                >
                  Prethodna
                </button>
                <button
                  type="button"
                  disabled={page >= orders.data!.pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="btn-secondary px-3 py-1.5 text-xs"
                >
                  Sljedeća
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
