import { Link } from 'react-router-dom';
import { AlertIcon, BoxIcon, EuroIcon, OrdersIcon, PlusIcon, UsersIcon } from '../components/Icons';
import { Alert, Loading, PageHeader, StatusBadge, Thumb } from '../components/ui';
import { formatDate, formatPrice } from '../lib/format';
import { useApi } from '../lib/hooks';
import { SETTABLE_STATUSES, STATUS_LABELS, type Stats } from '../types';

export default function Dashboard() {
  const { data, loading, error } = useApi<Stats>('/api/stats');

  if (loading) return <Loading />;
  if (error) return <Alert>{error}</Alert>;
  if (!data) return null;

  const cards = [
    {
      label: 'Prihod (plaćeno)',
      value: formatPrice(data.revenue),
      icon: EuroIcon,
      tint: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Narudžbe',
      value: String(data.orders),
      hint: `${data.paidOrders} plaćenih`,
      icon: OrdersIcon,
      tint: 'bg-brand-soft text-brand',
    },
    {
      label: 'Proizvodi',
      value: String(data.products),
      hint: `${data.activeProducts} aktivnih`,
      icon: BoxIcon,
      tint: 'bg-violet-50 text-violet-600',
    },
    {
      label: 'Kupci',
      value: String(data.customers),
      icon: UsersIcon,
      tint: 'bg-amber-50 text-amber-600',
    },
  ];

  const totalTracked = SETTABLE_STATUSES.reduce((sum, s) => sum + (data.byStatus[s] ?? 0), 0);

  return (
    <>
      <PageHeader
        title="Nadzorna ploča"
        subtitle="Pregled poslovanja trgovine u stvarnom vremenu."
        action={
          <Link to="/proizvodi/novi" className="btn-primary">
            <PlusIcon className="h-4 w-4" />
            Novi proizvod
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, hint, icon: Icon, tint }) => (
          <div key={label} className="card p-5">
            <div className="flex items-start justify-between">
              <p className="text-sm text-ink-soft">{label}</p>
              <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${tint}`}>
                <Icon className="h-[18px] w-[18px]" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
            {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Statusi narudžbi */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold">Narudžbe po statusu</h2>
          <ul className="mt-4 space-y-3">
            {SETTABLE_STATUSES.map((status) => {
              const count = data.byStatus[status] ?? 0;
              const percent = totalTracked > 0 ? (count / totalTracked) * 100 : 0;
              return (
                <li key={status}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink-soft">{STATUS_LABELS[status]}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-canvas">
                    <div
                      className="h-full rounded-full bg-brand transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </li>
              );
            })}
            {(data.byStatus.pending_payment ?? 0) > 0 && (
              <li className="border-t border-line pt-3 text-xs text-muted">
                {data.byStatus.pending_payment} narudžbi čeka plaćanje
              </li>
            )}
          </ul>
        </div>

        {/* Zadnje narudžbe */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="text-sm font-semibold">Zadnje narudžbe</h2>
            <Link to="/narudzbe" className="text-xs font-medium text-brand hover:underline">
              Sve narudžbe
            </Link>
          </div>

          {data.recentOrders.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted">Još nema narudžbi.</p>
          ) : (
            <ul className="divide-y divide-line">
              {data.recentOrders.map((order) => (
                <li key={order._id}>
                  <Link
                    to={`/narudzbe/${order._id}`}
                    className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-canvas"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{order.orderNumber}</p>
                      <p className="text-xs text-muted">
                        {typeof order.user === 'object' ? order.user.name : 'Kupac'} ·{' '}
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{formatPrice(order.total)}</span>
                      <StatusBadge status={order.status} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {data.lowStock.length > 0 && (
        <div className="card mt-6 p-5">
          <div className="flex items-center gap-2">
            <AlertIcon className="h-4 w-4 text-amber-600" />
            <h2 className="text-sm font-semibold">Niske zalihe</h2>
          </div>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.lowStock.map((product) => (
              <li key={product._id} className="flex items-center gap-3">
                <Thumb src={product.coverImage} alt={product.name} className="h-11 w-11" />
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/proizvodi/${product._id}`}
                    className="block truncate text-sm font-medium hover:text-brand"
                  >
                    {product.name}
                  </Link>
                  <p className="text-xs text-amber-600">Još {product.stock} kom.</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
