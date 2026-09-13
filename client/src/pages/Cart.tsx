import { Link, useSearchParams } from 'react-router-dom';
import { BagIcon, ArrowRight, MinusIcon, PlusIcon, TrashIcon } from '../components/Icons';
import ProductImage from '../components/ProductImage';
import { Alert, EmptyState, PageHeader } from '../components/ui';
import { formatPrice } from '../lib/format';
import {
  cartShipping,
  cartSubtotal,
  FREE_SHIPPING_THRESHOLD,
  useCart,
} from '../store/cart';
import { useAuth } from '../store/auth';

export default function Cart() {
  const [params] = useSearchParams();
  const items = useCart((s) => s.items);
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const clear = useCart((s) => s.clear);
  const user = useAuth((s) => s.user);

  const subtotal = cartSubtotal(items);
  const shipping = cartShipping(subtotal);
  const missingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  if (items.length === 0) {
    return (
      <div className="container-page py-14">
        <PageHeader title="Košarica" />
        <div className="mt-8">
          <EmptyState
            icon={<BagIcon className="h-10 w-10" />}
            title="Košarica je prazna"
            description="Još niste dodali nijedan komad. Pogledajte što je novo u kolekciji."
            actionLabel="U trgovinu"
            actionTo="/trgovina"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-10 lg:py-14">
      <PageHeader title="Košarica" subtitle={`${items.length} različitih artikala u košarici`} />

      {params.get('otkazano') && (
        <div className="mt-6">
          <Alert variant="info">
            Plaćanje je otkazano — vaša košarica je sačuvana. Možete pokušati ponovno.
          </Alert>
        </div>
      )}

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px] lg:gap-12">
        <div>
          <ul className="divide-y divide-line border-y border-line">
            {items.map((item) => (
              <li key={`${item.productId}-${item.size}`} className="flex gap-4 py-5">
                <Link
                  to={`/proizvod/${item.slug}`}
                  className="h-28 w-22 shrink-0 overflow-hidden rounded-xl bg-sand sm:h-32 sm:w-26"
                >
                  <ProductImage
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </Link>

                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        to={`/proizvod/${item.slug}`}
                        className="block truncate font-medium hover:underline"
                      >
                        {item.name}
                      </Link>
                      {item.size && <p className="mt-1 text-xs text-muted">Veličina: {item.size}</p>}
                      <p className="mt-1 text-sm text-ink-soft">{formatPrice(item.price)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(item.productId, item.size)}
                      className="rounded-full p-2 text-muted transition-colors hover:bg-sand hover:text-ink"
                      aria-label={`Ukloni ${item.name}`}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="flex items-center rounded-full border border-line">
                      <button
                        type="button"
                        onClick={() =>
                          setQuantity(item.productId, item.size, Math.max(1, item.quantity - 1))
                        }
                        disabled={item.quantity <= 1}
                        className="rounded-full p-2.5 transition-colors hover:bg-sand disabled:opacity-30"
                        aria-label="Smanji količinu"
                      >
                        <MinusIcon className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setQuantity(
                            item.productId,
                            item.size,
                            Math.min(item.stock || 99, item.quantity + 1),
                          )
                        }
                        disabled={item.quantity >= item.stock}
                        className="rounded-full p-2.5 transition-colors hover:bg-sand disabled:opacity-30"
                        aria-label="Povećaj količinu"
                      >
                        <PlusIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <Link to="/trgovina" className="text-sm text-ink-soft underline underline-offset-4 hover:text-ink">
              Nastavi kupovinu
            </Link>
            <button
              type="button"
              onClick={clear}
              className="text-sm text-muted underline underline-offset-4 hover:text-ink"
            >
              Isprazni košaricu
            </button>
          </div>
        </div>

        {/* Sažetak */}
        <aside className="lg:sticky lg:top-32 lg:self-start">
          <div className="card p-6">
            <h2 className="text-xl">Sažetak narudžbe</h2>

            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-soft">Međuzbroj</dt>
                <dd>{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">Dostava</dt>
                <dd>{shipping === 0 ? 'Besplatno' : formatPrice(shipping)}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-3 text-base font-medium">
                <dt>Ukupno</dt>
                <dd>{formatPrice(subtotal + shipping)}</dd>
              </div>
            </dl>

            {missingForFreeShipping > 0 && (
              <div className="mt-4 rounded-xl bg-sand p-3">
                <p className="text-xs text-ink-soft">
                  Još {formatPrice(missingForFreeShipping)} do besplatne dostave.
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
                  <div
                    className="h-full rounded-full bg-clay transition-all"
                    style={{ width: `${(subtotal / FREE_SHIPPING_THRESHOLD) * 100}%` }}
                  />
                </div>
              </div>
            )}

            <Link to={user ? '/naplata' : '/prijava'} state={{ from: '/naplata' }} className="btn-primary mt-6 w-full">
              {user ? 'Nastavi na plaćanje' : 'Prijavi se za plaćanje'}
              <ArrowRight className="h-4 w-4" />
            </Link>

            <p className="mt-3 text-center text-xs text-muted">
              Sigurno plaćanje karticom · PDV uključen u cijenu
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
