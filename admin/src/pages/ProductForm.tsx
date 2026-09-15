import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, SpinnerIcon } from '../components/Icons';
import ImageUploader from '../components/ImageUploader';
import { Alert, Loading } from '../components/ui';
import { api, ApiError } from '../lib/api';
import { formatPrice } from '../lib/format';
import { CATEGORIES, SIZES, type Product } from '../types';

interface FormState {
  name: string;
  description: string;
  price: string;
  compareAtPrice: string;
  category: string;
  coverImage: string[];
  images: string[];
  sizes: string[];
  colors: string;
  stock: string;
  featured: boolean;
  active: boolean;
}

const EMPTY: FormState = {
  name: '',
  description: '',
  price: '',
  compareAtPrice: '',
  category: CATEGORIES[0],
  coverImage: [],
  images: [],
  sizes: ['S', 'M', 'L'],
  colors: '',
  stock: '0',
  featured: false,
  active: true,
};

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    api<{ product: Product }>(`/api/products/${id}`)
      .then(({ product }) => {
        if (cancelled) return;
        setForm({
          name: product.name,
          description: product.description,
          price: String(product.price),
          compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : '',
          category: product.category,
          coverImage: product.coverImage ? [product.coverImage] : [],
          images: product.images,
          sizes: product.sizes,
          colors: product.colors.join(', '),
          stock: String(product.stock),
          featured: product.featured,
          active: product.active,
        });
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : 'Proizvod nije pronađen.');
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleSize = (size: string) =>
    set('sizes', form.sizes.includes(size) ? form.sizes.filter((s) => s !== size) : [...form.sizes, size]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (form.coverImage.length === 0) {
      return setError('Naslovna slika je obavezna.');
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : null,
      category: form.category,
      coverImage: form.coverImage[0],
      images: form.images,
      sizes: form.sizes,
      colors: form.colors
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean),
      stock: Number(form.stock),
      featured: form.featured,
      active: form.active,
    };

    setSaving(true);
    try {
      if (isEdit) {
        await api(`/api/products/${id}`, { method: 'PUT', body: payload });
      } else {
        await api('/api/products', { method: 'POST', body: payload });
      }
      navigate('/proizvodi');
    } catch (err) {
      setError(
        err instanceof ApiError
          ? [err.message, ...(err.errors ?? []).map((e) => e.message)].join(' ')
          : 'Spremanje nije uspjelo.',
      );
      setSaving(false);
    }
  };

  if (loading) return <Loading label="Učitavanje proizvoda…" />;

  const priceNumber = Number(form.price) || 0;
  const compareNumber = Number(form.compareAtPrice) || 0;
  const discount =
    compareNumber > priceNumber && priceNumber > 0
      ? Math.round((1 - priceNumber / compareNumber) * 100)
      : 0;

  return (
    <>
      <Link
        to="/proizvodi"
        className="mb-4 inline-flex items-center gap-1 text-sm text-ink-soft hover:text-ink"
      >
        <ChevronLeft className="h-4 w-4" />
        Natrag na proizvode
      </Link>

      <h1 className="text-2xl font-semibold tracking-tight">
        {isEdit ? 'Uredi proizvod' : 'Novi proizvod'}
      </h1>
      <p className="mt-1 text-sm text-ink-soft">
        Naslovna slika prikazuje se u katalogu, ostale slike u galeriji proizvoda.
      </p>

      <form onSubmit={submit} className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {error && <Alert>{error}</Alert>}

          <section className="card space-y-4 p-5">
            <h2 className="text-sm font-semibold">Osnovni podaci</h2>

            <div>
              <label className="label" htmlFor="name">
                Naziv proizvoda
              </label>
              <input
                id="name"
                required
                minLength={2}
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                className="input"
                placeholder="npr. Lanena košulja Riva"
              />
            </div>

            <div>
              <label className="label" htmlFor="description">
                Opis
              </label>
              <textarea
                id="description"
                required
                minLength={10}
                rows={6}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                className="input resize-y"
                placeholder="Materijal, kroj, održavanje…"
              />
              <p className="mt-1 text-xs text-muted">{form.description.length} znakova (min. 10)</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="category">
                  Kategorija
                </label>
                <select
                  id="category"
                  value={form.category}
                  onChange={(e) => set('category', e.target.value)}
                  className="input"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="stock">
                  Zaliha (kom.)
                </label>
                <input
                  id="stock"
                  type="number"
                  min={0}
                  required
                  value={form.stock}
                  onChange={(e) => set('stock', e.target.value)}
                  className="input"
                />
              </div>
            </div>
          </section>

          <section className="card space-y-5 p-5">
            <h2 className="text-sm font-semibold">Slike</h2>
            <ImageUploader
              label="Naslovna slika *"
              hint="Preporučeni omjer 3:4, do 6 MB"
              value={form.coverImage}
              onChange={(urls) => set('coverImage', urls)}
            />
            <ImageUploader
              label="Ostale slike"
              hint="Prikazuju se u galeriji proizvoda"
              multiple
              value={form.images}
              onChange={(urls) => set('images', urls)}
            />
          </section>

          <section className="card space-y-4 p-5">
            <h2 className="text-sm font-semibold">Varijante</h2>

            <div>
              <p className="label">Veličine</p>
              <div className="flex flex-wrap gap-2">
                {SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={`h-9 min-w-12 rounded-lg border px-3 text-sm transition-colors ${
                      form.sizes.includes(size)
                        ? 'border-brand bg-brand text-white'
                        : 'border-line text-ink-soft hover:border-muted'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted">
                Za obuću ili univerzalne veličine upišite ih ručno kroz polje ispod.
              </p>
              <input
                value={form.sizes.join(', ')}
                onChange={(e) =>
                  set(
                    'sizes',
                    e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean),
                  )
                }
                className="input mt-2"
                placeholder="npr. 38, 39, 40"
              />
            </div>

            <div>
              <label className="label" htmlFor="colors">
                Boje (odvojene zarezom)
              </label>
              <input
                id="colors"
                value={form.colors}
                onChange={(e) => set('colors', e.target.value)}
                className="input"
                placeholder="Bijela, Crna, Maslinasta"
              />
            </div>
          </section>
        </div>

        {/* Bočni stupac */}
        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <section className="card space-y-4 p-5">
            <h2 className="text-sm font-semibold">Cijena</h2>

            <div>
              <label className="label" htmlFor="price">
                Cijena (€)
              </label>
              <input
                id="price"
                type="number"
                step="0.01"
                min={0}
                required
                value={form.price}
                onChange={(e) => set('price', e.target.value)}
                className="input"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="label" htmlFor="compareAtPrice">
                Stara cijena (nije obavezno)
              </label>
              <input
                id="compareAtPrice"
                type="number"
                step="0.01"
                min={0}
                value={form.compareAtPrice}
                onChange={(e) => set('compareAtPrice', e.target.value)}
                className="input"
                placeholder="0.00"
              />
              {discount > 0 && (
                <p className="mt-1.5 text-xs text-emerald-600">
                  Prikazat će se kao sniženje od {discount} % ({formatPrice(priceNumber)} umjesto{' '}
                  {formatPrice(compareNumber)}).
                </p>
              )}
            </div>
          </section>

          <section className="card space-y-3 p-5">
            <h2 className="text-sm font-semibold">Vidljivost</h2>

            {[
              {
                key: 'active' as const,
                label: 'Aktivan u trgovini',
                hint: 'Skriveni proizvodi nisu vidljivi kupcima.',
              },
              {
                key: 'featured' as const,
                label: 'Izdvojen na naslovnici',
                hint: 'Prikazuje se u sekciji „Izdvojeno”.',
              },
            ].map(({ key, label, hint }) => (
              <label key={key} className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={(e) => set(key, e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-line text-brand focus:ring-brand"
                />
                <span>
                  <span className="block text-sm font-medium">{label}</span>
                  <span className="block text-xs text-muted">{hint}</span>
                </span>
              </label>
            ))}
          </section>

          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? <SpinnerIcon className="h-4 w-4" /> : isEdit ? 'Spremi promjene' : 'Dodaj proizvod'}
            </button>
            <Link to="/proizvodi" className="btn-secondary">
              Odustani
            </Link>
          </div>
        </aside>
      </form>
    </>
  );
}
