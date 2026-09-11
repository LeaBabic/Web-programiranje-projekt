import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowRight,
  CheckIcon,
  ChevronRight,
  LeafIcon,
  MinusIcon,
  PlusIcon,
  ReturnIcon,
  TruckIcon,
} from '../components/Icons';
import ProductCard from '../components/ProductCard';
import ProductImage from '../components/ProductImage';
import { Alert, EmptyState, Loading } from '../components/ui';
import { formatPrice } from '../lib/format';
import { useApi } from '../lib/hooks';
import { useCart } from '../store/cart';
import type { Product } from '../types';

interface Response {
  product: Product;
  related: Product[];
}

export default function ProductDetail() {
  const { slug } = useParams();
  const { data, loading, error } = useApi<Response>(slug ? `/api/products/${slug}` : null);
  const add = useCart((s) => s.add);

  const [size, setSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);

  const product = data?.product;

  // Nova stranica proizvoda — resetiraj odabir.
  useEffect(() => {
    setSize(product?.sizes[0] ?? '');
    setQuantity(1);
    setActiveImage(0);
    setAdded(false);
  }, [product?._id, product?.sizes]);

  useEffect(() => {
    if (!added) return;
    const timer = setTimeout(() => setAdded(false), 2500);
    return () => clearTimeout(timer);
  }, [added]);

  if (loading) return <Loading label="Učitavanje proizvoda…" />;
  if (error || !product) {
    return (
      <div className="container-page py-16">
        <EmptyState
          title="Proizvod nije pronađen"
          description={error ?? 'Ovaj proizvod više nije dostupan.'}
          actionLabel="Natrag u trgovinu"
          actionTo="/trgovina"
        />
      </div>
    );
  }

  const gallery = [product.coverImage, ...product.images];
  const onSale = product.compareAtPrice != null && product.compareAtPrice > product.price;
  const soldOut = product.stock <= 0;
  const lowStock = !soldOut && product.stock <= 5;

  const handleAdd = () => {
    add(product, size, quantity);
    setAdded(true);
  };

  return (
    <div className="container-page py-8 lg:py-12">
      <nav className="flex flex-wrap items-center gap-1.5 text-xs text-muted" aria-label="Staza">
        <Link to="/" className="hover:text-ink">
          Početna
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/trgovina" className="hover:text-ink">
          Trgovina
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link to={`/trgovina?category=${encodeURIComponent(product.category)}`} className="hover:text-ink">
          {product.category}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-14">
        {/* Galerija */}
        <div className="animate-fade-up">
          <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-sand">
            <ProductImage
              src={gallery[activeImage]}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
          {gallery.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-2 sm:gap-3">
              {gallery.map((image, i) => (
                <button
                  key={`${image}-${i}`}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={`aspect-square overflow-hidden rounded-xl border-2 transition-colors ${
                    activeImage === i ? 'border-ink' : 'border-transparent hover:border-line'
                  }`}
                  aria-label={`Prikaži sliku ${i + 1}`}
                >
                  <ProductImage src={image} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Informacije */}
        <div className="animate-fade-up lg:pt-4">
          <p className="text-xs font-semibold tracking-[0.2em] text-clay uppercase">
            {product.category}
          </p>
          <h1 className="mt-3 text-3xl sm:text-4xl">{product.name}</h1>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-display text-2xl">{formatPrice(product.price)}</span>
            {onSale && (
              <>
                <span className="text-muted line-through">
                  {formatPrice(product.compareAtPrice!)}
                </span>
                <span className="rounded-full bg-clay/10 px-2 py-0.5 text-xs font-medium text-clay">
                  −{Math.round((1 - product.price / product.compareAtPrice!) * 100)} %
                </span>
              </>
            )}
          </div>

          <p className="mt-5 text-sm leading-relaxed text-ink-soft">{product.description}</p>

          {product.colors.length > 0 && (
            <p className="mt-4 text-sm text-ink-soft">
              <span className="font-medium text-ink">Dostupne boje:</span>{' '}
              {product.colors.join(', ')}
            </p>
          )}

          {product.sizes.length > 0 && (
            <div className="mt-7">
              <div className="mb-2 flex items-center justify-between">
                <p className="label mb-0">Veličina</p>
                {size && <span className="text-xs text-muted">Odabrano: {size}</span>}
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    className={`h-11 min-w-14 rounded-xl border px-4 text-sm transition-all ${
                      size === s
                        ? 'border-ink bg-ink text-cream'
                        : 'border-line text-ink-soft hover:border-ink'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-full border border-line">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="rounded-full p-3 text-ink transition-colors hover:bg-sand disabled:opacity-30"
                aria-label="Smanji količinu"
              >
                <MinusIcon className="h-4 w-4" />
              </button>
              <span className="w-10 text-center text-sm font-medium" aria-live="polite">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))}
                disabled={quantity >= product.stock}
                className="rounded-full p-3 text-ink transition-colors hover:bg-sand disabled:opacity-30"
                aria-label="Povećaj količinu"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              disabled={soldOut}
              className="btn-primary flex-1 sm:flex-none sm:px-10"
            >
              {added ? (
                <>
                  <CheckIcon className="h-4 w-4" /> Dodano u košaricu
                </>
              ) : soldOut ? (
                'Rasprodano'
              ) : (
                'Dodaj u košaricu'
              )}
            </button>
          </div>

          {added && (
            <div className="mt-4">
              <Alert variant="success">
                Proizvod je u košarici.{' '}
                <Link to="/kosarica" className="font-medium underline underline-offset-2">
                  Idi na plaćanje
                </Link>
              </Alert>
            </div>
          )}

          <p className="mt-4 text-xs text-muted">
            {soldOut
              ? 'Trenutno nedostupno — javit ćemo kad se vrati na zalihu.'
              : lowStock
                ? `Još samo ${product.stock} kom. na zalihi`
                : `Na zalihi: ${product.stock} kom.`}
          </p>

          <ul className="mt-8 space-y-3 border-t border-line pt-6 text-sm text-ink-soft">
            <li className="flex items-center gap-3">
              <TruckIcon className="h-4 w-4 shrink-0 text-clay" />
              Dostava 2–4 radna dana · besplatno iznad 80 €
            </li>
            <li className="flex items-center gap-3">
              <ReturnIcon className="h-4 w-4 shrink-0 text-clay" />
              Povrat i zamjena unutar 30 dana
            </li>
            <li className="flex items-center gap-3">
              <LeafIcon className="h-4 w-4 shrink-0 text-clay" />
              Prirodni materijali iz europskih tkaonica
            </li>
          </ul>
        </div>
      </div>

      {data.related.length > 0 && (
        <section className="mt-20">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl sm:text-3xl">Moglo bi vam se svidjeti</h2>
            <Link
              to={`/trgovina?category=${encodeURIComponent(product.category)}`}
              className="group inline-flex items-center gap-1.5 text-sm font-medium"
            >
              Cijela kategorija
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4 lg:gap-x-6">
            {data.related.map((item, i) => (
              <ProductCard key={item._id} product={item} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
