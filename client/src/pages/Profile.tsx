import { useState, type FormEvent } from 'react';
import { BagIcon, CheckIcon, ChevronDown, SpinnerIcon } from '../components/Icons';
import ProductImage from '../components/ProductImage';
import { Alert, EmptyState, Loading, PageHeader } from '../components/ui';
import { api, ApiError } from '../lib/api';
import { formatDate, formatPrice } from '../lib/format';
import { useApi } from '../lib/hooks';
import { useAuth } from '../store/auth';
import { STATUS_LABELS, STATUS_STEPS, type Order, type User } from '../types';

type Tab = 'orders' | 'details';

export default function Profile() {
  const { user, setUser, logout } = useAuth();
  const orders = useApi<Order[]>('/api/orders/mine', { auth: true });
  const [tab, setTab] = useState<Tab>('orders');

  return (
    <div className="container-page py-10 lg:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageHeader
          eyebrow="Moj račun"
          title={`Pozdrav, ${user?.name.split(' ')[0] ?? ''}`}
          subtitle="Ovdje pratite status svojih narudžbi i uređujete podatke za dostavu."
        />
        <button
          type="button"
          onClick={logout}
          className="btn-secondary py-2.5 text-xs"
        >
          Odjava
        </button>
      </div>

      <div className="mt-8 flex gap-1 border-b border-line">
        {(
          [
            ['orders', 'Moje narudžbe'],
            ['details', 'Osobni podaci'],
          ] as [Tab, string][]
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={`-mb-px border-b-2 px-4 py-3 text-sm transition-colors ${
              tab === value
                ? 'border-ink text-ink'
                : 'border-transparent text-muted hover:text-ink-soft'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === 'orders' ? (
          orders.loading ? (
            <Loading label="Učitavanje narudžbi…" />
          ) : orders.error ? (
            <Alert>{orders.error}</Alert>
          ) : (orders.data?.length ?? 0) === 0 ? (
            <EmptyState
              icon={<BagIcon className="h-10 w-10" />}
              title="Još nemate narudžbi"
              description="Kada nešto naručite, ovdje ćete moći pratiti status isporuke korak po korak."
              actionLabel="U trgovinu"
              actionTo="/trgovina"
            />
          ) : (
            <div className="space-y-4">
              {orders.data!.map((order) => (
                <OrderCard key={order._id} order={order} />
              ))}
            </div>
          )
        ) : (
          <ProfileForm user={user!} onSaved={setUser} />
        )}
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const [open, setOpen] = useState(false);
  const unpaid = order.status === 'pending_payment';
  const currentStep = STATUS_STEPS.indexOf(order.status);

  return (
    <article className="card animate-fade-up overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full flex-wrap items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-sand/60 sm:px-6"
        aria-expanded={open}
      >
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
          <div>
            <p className="text-xs text-muted">Narudžba</p>
            <p className="font-medium">{order.orderNumber}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Datum</p>
            <p className="text-sm">{formatDate(order.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Iznos</p>
            <p className="text-sm">{formatPrice(order.total)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              unpaid ? 'bg-sand text-ink-soft' : 'bg-ink text-cream'
            }`}
          >
            {STATUS_LABELS[order.status]}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-muted transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {open && (
        <div className="border-t border-line px-5 py-6 sm:px-6">
          {/* Praćenje statusa */}
          {unpaid ? (
            <Alert variant="info">
              Plaćanje ove narudžbe nije dovršeno, pa je obrada još nije započela.
            </Alert>
          ) : (
            <ol className="flex flex-col gap-4 sm:flex-row sm:gap-0">
              {STATUS_STEPS.map((step, i) => {
                const done = i <= currentStep;
                const active = i === currentStep;
                return (
                  <li key={step} className="flex flex-1 items-center gap-3 sm:flex-col sm:gap-2">
                    <div className="flex items-center sm:w-full">
                      {/* Linija lijevo (samo na širim ekranima) */}
                      <span
                        className={`hidden h-px flex-1 sm:block ${
                          i === 0 ? 'bg-transparent' : done ? 'bg-ink' : 'bg-line'
                        }`}
                      />
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs ${
                          done
                            ? 'border-ink bg-ink text-cream'
                            : 'border-line bg-white text-muted'
                        }`}
                      >
                        {done ? <CheckIcon className="h-3.5 w-3.5" /> : i + 1}
                      </span>
                      <span
                        className={`hidden h-px flex-1 sm:block ${
                          i === STATUS_STEPS.length - 1
                            ? 'bg-transparent'
                            : i < currentStep
                              ? 'bg-ink'
                              : 'bg-line'
                        }`}
                      />
                    </div>
                    <p
                      className={`text-xs sm:text-center ${
                        active ? 'font-medium text-ink' : done ? 'text-ink-soft' : 'text-muted'
                      }`}
                    >
                      {STATUS_LABELS[step]}
                    </p>
                  </li>
                );
              })}
            </ol>
          )}

          <ul className="mt-6 divide-y divide-line border-t border-line">
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

          <div className="mt-4 grid gap-6 border-t border-line pt-4 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs tracking-wide text-muted uppercase">Adresa dostave</p>
              <p className="mt-1.5 text-ink-soft">
                {order.shippingAddress.fullName}
                <br />
                {order.shippingAddress.street}
                <br />
                {order.shippingAddress.postalCode} {order.shippingAddress.city}
                <br />
                {order.shippingAddress.country}
              </p>
            </div>
            <dl className="space-y-2 sm:text-right">
              <div className="flex justify-between sm:justify-end sm:gap-8">
                <dt className="text-ink-soft">Međuzbroj</dt>
                <dd>{formatPrice(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between sm:justify-end sm:gap-8">
                <dt className="text-ink-soft">Dostava</dt>
                <dd>{order.shipping === 0 ? 'Besplatno' : formatPrice(order.shipping)}</dd>
              </div>
              <div className="flex justify-between font-medium sm:justify-end sm:gap-8">
                <dt>Ukupno</dt>
                <dd>{formatPrice(order.total)}</dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </article>
  );
}

function ProfileForm({ user, onSaved }: { user: User; onSaved: (user: User) => void }) {
  const [form, setForm] = useState({
    name: user.name,
    phone: user.phone ?? '',
    street: user.address?.street ?? '',
    city: user.address?.city ?? '',
    postalCode: user.address?.postalCode ?? '',
    country: user.address?.country ?? 'Hrvatska',
  });
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setStatus('saving');
    try {
      const res = await api<{ user: User }>('/api/auth/me', {
        method: 'PUT',
        auth: true,
        body: {
          name: form.name,
          phone: form.phone,
          address: {
            street: form.street,
            city: form.city,
            postalCode: form.postalCode,
            country: form.country,
          },
        },
      });
      onSaved(res.user);
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 2500);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Spremanje nije uspjelo.');
      setStatus('idle');
    }
  };

  return (
    <form onSubmit={submit} className="card max-w-2xl space-y-4 p-6 sm:p-8">
      {error && <Alert>{error}</Alert>}
      {status === 'saved' && <Alert variant="success">Podaci su spremljeni.</Alert>}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="name">
            Ime i prezime
          </label>
          <input
            id="name"
            required
            minLength={2}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="email">
            E-mail
          </label>
          <input id="email" value={user.email} readOnly className="input bg-sand" />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="phone">
            Telefon
          </label>
          <input
            id="phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="input"
            placeholder="+385 91 234 5678"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="street">
            Ulica i kućni broj
          </label>
          <input
            id="street"
            value={form.street}
            onChange={(e) => setForm({ ...form, street: e.target.value })}
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="postalCode">
            Poštanski broj
          </label>
          <input
            id="postalCode"
            value={form.postalCode}
            onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="city">
            Grad
          </label>
          <input
            id="city"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            className="input"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="country">
            Država
          </label>
          <input
            id="country"
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
            className="input"
          />
        </div>
      </div>

      <button type="submit" disabled={status === 'saving'} className="btn-primary">
        {status === 'saving' ? <SpinnerIcon className="h-4 w-4" /> : 'Spremi promjene'}
      </button>
    </form>
  );
}
