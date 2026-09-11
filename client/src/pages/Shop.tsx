import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CloseIcon, SearchIcon } from '../components/Icons';
import ProductCard from '../components/ProductCard';
import { EmptyState, PageHeader, ProductGridSkeleton } from '../components/ui';
import { useApi } from '../lib/hooks';
import type { Category, ProductList } from '../types';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const SORTS = [
  { value: 'newest', label: 'Najnovije' },
  { value: 'price_asc', label: 'Cijena: rastuće' },
  { value: 'price_desc', label: 'Cijena: padajuće' },
  { value: 'name_asc', label: 'Naziv A–Ž' },
];

const PRICE_RANGES = [
  { label: 'Do 50 €', min: '', max: '50' },
  { label: '50 – 100 €', min: '50', max: '100' },
  { label: '100 – 150 €', min: '100', max: '150' },
  { label: 'Iznad 150 €', min: '150', max: '' },
];

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(params.get('search') ?? '');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const category = params.get('category') ?? '';
  const size = params.get('size') ?? '';
  const sort = params.get('sort') ?? 'newest';
  const search = params.get('search') ?? '';
  const minPrice = params.get('minPrice') ?? '';
  const maxPrice = params.get('maxPrice') ?? '';
  const page = Number(params.get('page') ?? '1');

  useEffect(() => setSearchInput(search), [search]);

  const query = useMemo(() => {
    const q = new URLSearchParams({ sort, page: String(page), limit: '12' });
    if (category) q.set('category', category);
    if (size) q.set('size', size);
    if (search) q.set('search', search);
    if (minPrice) q.set('minPrice', minPrice);
    if (maxPrice) q.set('maxPrice', maxPrice);
    return q.toString();
  }, [category, size, sort, search, minPrice, maxPrice, page]);

  const products = useApi<ProductList>(`/api/products?${query}`);
  const categories = useApi<Category[]>('/api/products/categories');

  /** Promjena filtra uvijek vraća popis na prvu stranicu. */
  const update = (changes: Record<string, string>) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    if (!('page' in changes)) next.delete('page');
    setParams(next);
  };

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    update({ search: searchInput.trim() });
  };

  const activeFilters = [
    category && { key: 'category', label: category },
    size && { key: 'size', label: `Veličina ${size}` },
    search && { key: 'search', label: `„${search}”` },
    (minPrice || maxPrice) && {
      key: 'price',
      label: `${minPrice || '0'} – ${maxPrice || '∞'} €`,
    },
  ].filter(Boolean) as { key: string; label: string }[];

  const clearFilter = (key: string) => {
    if (key === 'price') return update({ minPrice: '', maxPrice: '' });
    update({ [key]: '' });
  };

  const clearAll = () => setParams(new URLSearchParams());

  const filterPanel = (
    <div className="space-y-8">
      <div>
        <p className="label">Kategorija</p>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => update({ category: '' })}
            className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
              !category ? 'bg-ink text-cream' : 'text-ink-soft hover:bg-sand'
            }`}
          >
            Sve kategorije
          </button>
          {(categories.data ?? []).map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => update({ category: c.name })}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                category === c.name ? 'bg-ink text-cream' : 'text-ink-soft hover:bg-sand'
              }`}
            >
              <span>{c.name}</span>
              <span className={category === c.name ? 'text-cream/60' : 'text-muted'}>{c.count}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="label">Veličina</p>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => update({ size: size === s ? '' : s })}
              className={`h-9 min-w-11 rounded-lg border px-3 text-sm transition-colors ${
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

      <div>
        <p className="label">Cijena</p>
        <div className="space-y-1">
          {PRICE_RANGES.map((range) => {
            const active = minPrice === range.min && maxPrice === range.max;
            return (
              <button
                key={range.label}
                type="button"
                onClick={() =>
                  update(
                    active
                      ? { minPrice: '', maxPrice: '' }
                      : { minPrice: range.min, maxPrice: range.max },
                  )
                }
                className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  active ? 'bg-ink text-cream' : 'text-ink-soft hover:bg-sand'
                }`}
              >
                {range.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="container-page py-10 lg:py-14">
      <PageHeader
        eyebrow="Trgovina"
        title="Cijela kolekcija"
        subtitle="Pomno odabrani komadi od prirodnih materijala — filtrirajte po kategoriji, veličini ili cijeni."
      />

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={submitSearch} className="relative w-full sm:max-w-xs">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Pretraži proizvode…"
            aria-label="Pretraži proizvode"
            className="input pl-10"
          />
        </form>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="btn-secondary py-2.5 lg:hidden"
          >
            Filteri {activeFilters.length > 0 && `(${activeFilters.length})`}
          </button>
          <label className="sr-only" htmlFor="sort">
            Sortiraj
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => update({ sort: e.target.value })}
            className="input w-auto py-2.5 pr-8"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {activeFilters.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {activeFilters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => clearFilter(filter.key)}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-xs text-ink-soft transition-colors hover:border-ink"
            >
              {filter.label}
              <CloseIcon className="h-3 w-3" />
            </button>
          ))}
          <button
            type="button"
            onClick={clearAll}
            className="text-xs text-muted underline underline-offset-4 hover:text-ink"
          >
            Očisti sve
          </button>
        </div>
      )}

      <div className="mt-8 grid gap-10 lg:grid-cols-[220px_1fr] lg:gap-12">
        <aside className="hidden lg:block">{filterPanel}</aside>

        <div>
          {products.loading ? (
            <ProductGridSkeleton count={9} />
          ) : products.error ? (
            <EmptyState title="Greška" description={products.error} />
          ) : (products.data?.items.length ?? 0) === 0 ? (
            <EmptyState
              title="Nema rezultata"
              description="Za odabrane filtre nismo pronašli nijedan proizvod. Pokušajte s drugom kategorijom ili očistite filtre."
              actionLabel="Očisti filtre"
              actionTo="/trgovina"
            />
          ) : (
            <>
              <p className="mb-5 text-sm text-muted">
                Prikazano {products.data!.items.length} od {products.data!.total} proizvoda
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:gap-x-6">
                {products.data!.items.map((product, i) => (
                  <ProductCard key={product._id} product={product} index={i} />
                ))}
              </div>

              {products.data!.pages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => update({ page: String(page - 1) })}
                    className="btn-secondary px-4 py-2 text-xs"
                  >
                    Prethodna
                  </button>
                  {Array.from({ length: products.data!.pages }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => update({ page: String(i + 1) })}
                      className={`h-9 w-9 rounded-full text-sm transition-colors ${
                        page === i + 1 ? 'bg-ink text-cream' : 'text-ink-soft hover:bg-sand'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={page >= products.data!.pages}
                    onClick={() => update({ page: String(page + 1) })}
                    className="btn-secondary px-4 py-2 text-xs"
                  >
                    Sljedeća
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Filteri na mobitelu */}
      {filtersOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-ink/40"
            onClick={() => setFiltersOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 w-[85%] max-w-sm overflow-y-auto bg-cream p-6">
            <div className="mb-6 flex items-center justify-between">
              <p className="font-display text-xl">Filteri</p>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="rounded-full p-2 hover:bg-sand"
                aria-label="Zatvori filtere"
              >
                <CloseIcon />
              </button>
            </div>
            {filterPanel}
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              className="btn-primary mt-8 w-full"
            >
              Prikaži rezultate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
