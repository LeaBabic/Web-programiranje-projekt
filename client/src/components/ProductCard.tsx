import { Link } from 'react-router-dom';
import { formatPrice } from '../lib/format';
import type { Product } from '../types';
import ProductImage from './ProductImage';

interface Props {
  product: Product;
  /** Blago odgođena animacija za efekt kaskade u mreži. */
  index?: number;
}

export default function ProductCard({ product, index = 0 }: Props) {
  const onSale = product.compareAtPrice != null && product.compareAtPrice > product.price;
  const soldOut = product.stock <= 0;

  return (
    <Link
      to={`/proizvod/${product.slug}`}
      className="group animate-fade-up block"
      style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-sand">
        <ProductImage
          src={product.coverImage}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />

        {product.images[0] && (
          <ProductImage
            src={product.images[0]}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}

        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {onSale && !soldOut && (
            <span className="rounded-full bg-clay px-2.5 py-1 text-[10px] font-semibold tracking-wider text-cream uppercase">
              Sniženo
            </span>
          )}
          {soldOut && (
            <span className="rounded-full bg-ink px-2.5 py-1 text-[10px] font-semibold tracking-wider text-cream uppercase">
              Rasprodano
            </span>
          )}
        </div>
      </div>

      <div className="mt-3.5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-[0.95rem] font-medium text-ink">{product.name}</h3>
          <p className="mt-0.5 text-xs text-muted">{product.category}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[0.95rem] font-medium text-ink">{formatPrice(product.price)}</p>
          {onSale && (
            <p className="text-xs text-muted line-through">{formatPrice(product.compareAtPrice!)}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
