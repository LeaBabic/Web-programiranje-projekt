import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldIcon, SpinnerIcon } from '../components/Icons';
import ProductImage from '../components/ProductImage';
import { Alert, PageHeader } from '../components/ui';
import { api, ApiError } from '../lib/api';
import { formatPrice } from '../lib/format';
import { useAuth } from '../store/auth';
import { cartShipping, cartSubtotal, useCart } from '../store/cart';

interface CheckoutResponse {
  orderId: string;
  mode: 'stripe' | 'demo';
  checkoutUrl: string;
}

export default function Checkout() {
  const navigate = useNavigate();
  const user = useAuth((s) => s.user);
  const items = useCart((s) => s.items);

  const [form, setForm] = useState({
    fullName: user?.name ?? '',
    phone: user?.phone ?? '',
    street: user?.address?.street ?? '',
    city: user?.address?.city ?? '',
    postalCode: user?.address?.postalCode ?? '',
    country: user?.address?.country ?? 'Hrvatska',
    note: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const subtotal = cartSubtotal(items);
  const shipping = cartShipping(subtotal);
  const total = subtotal + shipping;

  const set =
    (key: keyof typeof form) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: event.target.value }));

  if (items.length === 0) {
    return (
      <div className="container-page py-16">
        <PageHeader title="Naplata" />
        <div className="mt-6 max-w-md">
          <Alert variant="info">
            Košarica je prazna.{' '}
            <Link to="/trgovina" className="font-medium underline underline-offset-2">
              Vratite se u trgovinu
            </Link>
            .
          </Alert>
        </div>
      </div>
    );
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await api<CheckoutResponse>('/api/orders', {
        method: 'POST',
        auth: true,
        body: {
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            size: i.size,
          })),
          shippingAddress: {
            fullName: form.fullName,
            phone: form.phone,
            street: form.street,
            city: form.city,
            postalCode: form.postalCode,
            country: form.country,
          },
          note: form.note,
        },
      });

      // Stripe vodi na vanjsku stranicu za plaćanje; DEMO ostaje unutar aplikacije.
      if (response.mode === 'stripe') {
        window.location.href = response.checkoutUrl;
        return;
      }
      navigate(`/narudzba/uspjeh?order=${response.orderId}&demo=1`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Plaćanje nije uspjelo. Pokušajte ponovno.');
      setSubmitting(false);
    }
  };

  return (
    <div className="container-page py-10 lg:py-14">
      <PageHeader
        eyebrow="Korak 2 od 2"
        title="Podaci za dostavu"
        subtitle="Provjerite podatke i nastavite na sigurno plaćanje karticom."
      />

      <form onSubmit={submit} className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px] lg:gap-12">
        <div className="space-y-6">
          {error && <Alert>{error}</Alert>}

          <div className="card p-6">
            <h2 className="text-lg">Kontakt</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label" htmlFor="fullName">
                  Ime i prezime
                </label>
                <input
                  id="fullName"
                  required
                  minLength={2}
                  value={form.fullName}
                  onChange={set('fullName')}
                  className="input"
                  autoComplete="name"
                />
              </div>
              <div>
                <label className="label" htmlFor="email">
                  E-mail
                </label>
                <input id="email" value={user?.email ?? ''} readOnly className="input bg-sand" />
              </div>
              <div>
                <label className="label" htmlFor="phone">
                  Telefon
                </label>
                <input
                  id="phone"
                  value={form.phone}
                  onChange={set('phone')}
                  className="input"
                  placeholder="+385 91 234 5678"
                  autoComplete="tel"
                />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg">Adresa dostave</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label" htmlFor="street">
                  Ulica i kućni broj
                </label>
                <input
                  id="street"
                  required
                  minLength={2}
                  value={form.street}
                  onChange={set('street')}
                  className="input"
                  autoComplete="street-address"
                />
              </div>
              <div>
                <label className="label" htmlFor="postalCode">
                  Poštanski broj
                </label>
                <input
                  id="postalCode"
                  required
                  minLength={2}
                  value={form.postalCode}
                  onChange={set('postalCode')}
                  className="input"
                  autoComplete="postal-code"
                />
              </div>
              <div>
                <label className="label" htmlFor="city">
                  Grad
                </label>
                <input
                  id="city"
                  required
                  minLength={2}
                  value={form.city}
                  onChange={set('city')}
                  className="input"
                  autoComplete="address-level2"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="country">
                  Država
                </label>
                <input
                  id="country"
                  required
                  value={form.country}
                  onChange={set('country')}
                  className="input"
                  autoComplete="country-name"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="note">
                  Napomena (nije obavezno)
                </label>
                <textarea
                  id="note"
                  rows={3}
                  value={form.note}
                  onChange={set('note')}
                  className="input resize-none"
                  placeholder="Npr. ostaviti kod susjeda"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sažetak */}
        <aside className="lg:sticky lg:top-32 lg:self-start">
          <div className="card p-6">
            <h2 className="text-lg">Vaša narudžba</h2>

            <ul className="mt-4 space-y-3">
              {items.map((item) => (
                <li key={`${item.productId}-${item.size}`} className="flex gap-3">
                  <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-sand">
                    <ProductImage
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[10px] text-cream">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    {item.size && <p className="text-xs text-muted">Veličina: {item.size}</p>}
                  </div>
                  <p className="text-sm">{formatPrice(item.price * item.quantity)}</p>
                </li>
              ))}
            </ul>

            <dl className="mt-5 space-y-2.5 border-t border-line pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-soft">Međuzbroj</dt>
                <dd>{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">Dostava</dt>
                <dd>{shipping === 0 ? 'Besplatno' : formatPrice(shipping)}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-2.5 text-base font-medium">
                <dt>Ukupno</dt>
                <dd>{formatPrice(total)}</dd>
              </div>
            </dl>

            <button type="submit" disabled={submitting} className="btn-primary mt-6 w-full">
              {submitting ? (
                <>
                  <SpinnerIcon className="h-4 w-4" /> Priprema plaćanja…
                </>
              ) : (
                <>
                  Plati {formatPrice(total)}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-muted">
              <ShieldIcon className="h-3.5 w-3.5" />
              Plaćanje obrađuje Stripe
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}
