import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { EditIcon, PlusIcon, SearchIcon, TrashIcon } from '../components/Icons';
import { Alert, ConfirmDialog, EmptyState, Loading, PageHeader, Thumb } from '../components/ui';
import { api, ApiError } from '../lib/api';
import { formatPrice } from '../lib/format';
import { useApi } from '../lib/hooks';
import { CATEGORIES, type Paginated, type Product } from '../types';

export default function Products() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const query = useMemo(() => {
    const q = new URLSearchParams({
      includeInactive: 'true',
      limit: '20',
      page: String(page),
      sort: 'newest',
    });
    if (search.trim()) q.set('search', search.trim());
    if (category) q.set('category', category);
    return q.toString();
  }, [search, category, page]);

  const products = useApi<Paginated<Product>>(`/api/products?${query}`);

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    setError(null);
    try {
      await api(`/api/products/${toDelete._id}`, { method: 'DELETE' });
      setToDelete(null);
      await products.reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Brisanje nije uspjelo.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Proizvodi"
        subtitle="Dodavanje, uređivanje i brisanje artikala u trgovini."
        action={
          <Link to="/proizvodi/novi" className="btn-primary">
            <PlusIcon className="h-4 w-4" />
            Novi proizvod
          </Link>
        }
      />

      {error && (
        <div className="mb-4">
          <Alert>{error}</Alert>
        </div>
      )}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Pretraži po nazivu…"
            aria-label="Pretraži proizvode"
            className="input pl-9"
          />
        </div>
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          aria-label="Filtriraj po kategoriji"
          className="input sm:w-52"
        >
          <option value="">Sve kategorije</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {products.loading ? (
        <Loading />
      ) : products.error ? (
        <Alert>{products.error}</Alert>
      ) : (products.data?.items.length ?? 0) === 0 ? (
        <EmptyState
          title="Nema proizvoda"
          description="Za zadane filtre nema rezultata. Dodajte prvi proizvod ili promijenite pretragu."
          action={
            <Link to="/proizvodi/novi" className="btn-primary">
              <PlusIcon className="h-4 w-4" />
              Novi proizvod
            </Link>
          }
        />
      ) : (
        <>
          <div className="card overflow-hidden">
            {/* Tablica na širokim ekranima */}
            <table className="hidden w-full text-sm md:table">
              <thead className="border-b border-line bg-canvas text-left text-xs text-ink-soft uppercase">
                <tr>
                  <th className="px-5 py-3 font-semibold">Proizvod</th>
                  <th className="px-4 py-3 font-semibold">Kategorija</th>
                  <th className="px-4 py-3 font-semibold">Cijena</th>
                  <th className="px-4 py-3 font-semibold">Zaliha</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 text-right font-semibold">Radnje</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {products.data!.items.map((product) => (
                  <tr key={product._id} className="transition-colors hover:bg-canvas">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Thumb src={product.coverImage} alt={product.name} className="h-12 w-10" />
                        <div className="min-w-0">
                          <Link
                            to={`/proizvodi/${product._id}`}
                            className="block max-w-[16rem] truncate font-medium hover:text-brand"
                          >
                            {product.name}
                          </Link>
                          <p className="text-xs text-muted">
                            {product.images.length + 1} slika · {product.sizes.join(', ') || '—'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{product.category}</td>
                    <td className="px-4 py-3">
                      <span className="font-medium">{formatPrice(product.price)}</span>
                      {product.compareAtPrice ? (
                        <span className="ml-2 text-xs text-muted line-through">
                          {formatPrice(product.compareAtPrice)}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          product.stock <= 3 ? 'font-medium text-amber-600' : 'text-ink-soft'
                        }
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ring-1 ring-inset ${
                            product.active
                              ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                              : 'bg-canvas text-muted ring-line'
                          }`}
                        >
                          {product.active ? 'Aktivan' : 'Skriven'}
                        </span>
                        {product.featured && (
                          <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs text-brand ring-1 ring-brand/20 ring-inset">
                            Izdvojen
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <Link
                          to={`/proizvodi/${product._id}`}
                          className="rounded-lg p-2 text-ink-soft transition-colors hover:bg-brand-soft hover:text-brand"
                          aria-label={`Uredi ${product.name}`}
                        >
                          <EditIcon className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setToDelete(product)}
                          className="rounded-lg p-2 text-ink-soft transition-colors hover:bg-red-50 hover:text-red-600"
                          aria-label={`Obriši ${product.name}`}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Kartice na mobitelu */}
            <ul className="divide-y divide-line md:hidden">
              {products.data!.items.map((product) => (
                <li key={product._id} className="flex gap-3 p-4">
                  <Thumb src={product.coverImage} alt={product.name} className="h-20 w-16" />
                  <div className="min-w-0 flex-1">
                    <Link to={`/proizvodi/${product._id}`} className="block truncate font-medium">
                      {product.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted">
                      {product.category} · zaliha {product.stock}
                    </p>
                    <p className="mt-1 text-sm font-medium">{formatPrice(product.price)}</p>
                    <div className="mt-2 flex gap-2">
                      <Link to={`/proizvodi/${product._id}`} className="btn-secondary px-3 py-1.5 text-xs">
                        Uredi
                      </Link>
                      <button
                        type="button"
                        onClick={() => setToDelete(product)}
                        className="btn-secondary px-3 py-1.5 text-xs text-red-600"
                      >
                        Obriši
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm">
            <p className="text-muted">
              Ukupno {products.data!.total} proizvoda · stranica {products.data!.page} od{' '}
              {products.data!.pages}
            </p>
            {products.data!.pages > 1 && (
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
                  disabled={page >= products.data!.pages}
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

      <ConfirmDialog
        open={toDelete !== null}
        title="Obrisati proizvod?"
        description={`Proizvod „${toDelete?.name ?? ''}” bit će trajno uklonjen iz trgovine. Ova radnja se ne može poništiti.`}
        confirmLabel="Obriši"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
