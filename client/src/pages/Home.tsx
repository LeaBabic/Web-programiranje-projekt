import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import ProductImage from '../components/ProductImage';
import { ArrowRight, LeafIcon, ReturnIcon, ShieldIcon, StarIcon, TruckIcon } from '../components/Icons';
import { ProductGridSkeleton } from '../components/ui';
import { useApi } from '../lib/hooks';
import type { Category, ProductList } from '../types';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=80';
const EDITORIAL_IMAGE =
  'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1200&q=80';

const CATEGORY_IMAGES: Record<string, string> = {
  Majice: '1521572163474-6864f9cf17ab',
  Košulje: '1596755094514-f87e34085b2c',
  Hlače: '1542272604-787c3835535d',
  Haljine: '1595777457583-95e059d581b8',
  Jakne: '1544022613-e87ca75a784a',
  Džemperi: '1608234808654-2a8875faa7fd',
  Obuća: '1549298916-b41d501d3772',
  Dodaci: '1553062407-98eeb64c6a62',
};

const BENEFITS = [
  { icon: TruckIcon, title: 'Besplatna dostava', text: 'Za sve narudžbe iznad 80 €' },
  { icon: ReturnIcon, title: 'Povrat 30 dana', text: 'Bez pitanja i bez troška' },
  { icon: LeafIcon, title: 'Prirodni materijali', text: 'Pamuk, lan i merino vuna' },
  { icon: ShieldIcon, title: 'Sigurno plaćanje', text: 'Kartično plaćanje putem Stripea' },
];

const REVIEWS = [
  {
    quote:
      'Lanena košulja je nakon tri mjeseca nošenja ljepša nego prvi dan. Konačno nešto što se ne rastegne.',
    name: 'Petra M.',
    city: 'Split',
  },
  {
    quote:
      'Naručila u utorak, u četvrtak je bilo na vratima. Veličine odgovaraju tablici, što je rijetkost.',
    name: 'Ivan K.',
    city: 'Zagreb',
  },
  {
    quote: 'Kvaliteta materijala se osjeti odmah. Traperice su mi postale omiljeni komad u ormaru.',
    name: 'Lucija B.',
    city: 'Rijeka',
  },
];

export default function Home() {
  const featured = useApi<ProductList>('/api/products?featured=true&limit=8');
  const categories = useApi<Category[]>('/api/products/categories');

  return (
    <>
      {/* HERO */}
      <section className="container-page pt-6 pb-16 lg:pt-10">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
          <div className="animate-fade-up order-2 lg:order-1">
            <p className="text-xs font-semibold tracking-[0.25em] text-clay uppercase">
              Kolekcija 2026
            </p>
            <h1 className="mt-4 text-4xl leading-[1.08] sm:text-5xl lg:text-6xl">
              Odjeća koja
              <br />
              <span className="italic">preživi</span> sezonu.
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-ink-soft">
              Male serije, prirodne tkanine i krojevi bez roka trajanja. Svaki komad iz ATELIER-a
              nastaje u europskim radionicama s kojima surađujemo godinama.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/trgovina" className="btn-primary">
                Pogledaj kolekciju
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/o-nama" className="btn-secondary">
                Naša priča
              </Link>
            </div>

            <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-line pt-8">
              {[
                { value: '14', label: 'komada u kolekciji' },
                { value: '4.9', label: 'prosječna ocjena' },
                { value: '30', label: 'dana za povrat' },
              ].map((stat) => (
                <div key={stat.label}>
                  <dt className="font-display text-2xl">{stat.value}</dt>
                  <dd className="mt-1 text-xs leading-snug text-muted">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="animate-fade-up relative order-1 lg:order-2">
            <div className="aspect-[4/5] overflow-hidden rounded-[2rem] bg-sand">
              <ProductImage
                src={HERO_IMAGE}
                alt="Model u odjeći iz nove kolekcije"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="card absolute -bottom-5 -left-2 hidden max-w-[13rem] p-4 shadow-xl sm:block lg:-left-6">
              <div className="flex gap-0.5 text-clay">
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon key={i} className="h-3.5 w-3.5" />
                ))}
              </div>
              <p className="mt-2 text-xs leading-relaxed text-ink-soft">
                „Najudobnija majica koju sam ikad imala.”
              </p>
              <p className="mt-1.5 text-[11px] text-muted">— Marta, vjerna kupica</p>
            </div>
          </div>
        </div>
      </section>

      {/* PREDNOSTI */}
      <section className="border-y border-line bg-sand">
        <div className="container-page grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-start gap-3">
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-clay" />
              <div>
                <p className="text-sm font-medium">{title}</p>
                <p className="mt-0.5 text-xs text-ink-soft">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* KATEGORIJE */}
      <section className="container-page py-16 lg:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl sm:text-4xl">Pretraži po kategoriji</h2>
            <p className="mt-2 text-ink-soft">Od svakodnevnih majica do komada za posebne prilike.</p>
          </div>
          <Link
            to="/trgovina"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-ink"
          >
            Sve kategorije
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {(categories.data ?? []).slice(0, 8).map((category, i) => (
            <Link
              key={category.name}
              to={`/trgovina?category=${encodeURIComponent(category.name)}`}
              className="group animate-fade-up relative aspect-[4/5] overflow-hidden rounded-2xl bg-sand"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <ProductImage
                src={`https://images.unsplash.com/photo-${
                  CATEGORY_IMAGES[category.name] ?? CATEGORY_IMAGES.Majice
                }?auto=format&fit=crop&w=600&q=80`}
                alt={category.name}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
              <div className="absolute right-3 bottom-3 left-3 text-cream">
                <p className="font-display text-lg">{category.name}</p>
                <p className="text-[11px] opacity-80">{category.count} proizvoda</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* IZDVOJENO */}
      <section className="container-page pb-16 lg:pb-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-clay uppercase">Izdvojeno</p>
            <h2 className="mt-2 text-3xl sm:text-4xl">Omiljeni komadi sezone</h2>
          </div>
          <Link
            to="/trgovina"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-ink"
          >
            Pogledaj sve
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="mt-8">
          {featured.loading ? (
            <ProductGridSkeleton count={4} />
          ) : featured.error ? (
            <p className="text-sm text-ink-soft">{featured.error}</p>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4 lg:gap-x-6">
              {(featured.data?.items ?? []).slice(0, 8).map((product, i) => (
                <ProductCard key={product._id} product={product} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* EDITORIJAL */}
      <section className="container-page pb-16 lg:pb-20">
        <div className="overflow-hidden rounded-[2rem] bg-ink text-cream">
          <div className="grid lg:grid-cols-2">
            <div className="order-2 flex flex-col justify-center p-8 sm:p-12 lg:order-1 lg:p-16">
              <p className="text-xs font-semibold tracking-[0.25em] text-cream/60 uppercase">
                Naš pristup
              </p>
              <h2 className="mt-4 text-3xl leading-tight sm:text-4xl">
                Napravljeno da traje,
                <br />a ne da se mijenja svaki mjesec.
              </h2>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-cream/70">
                Ne pratimo mikro-trendove. Dizajniramo dvije kolekcije godišnje, u malim serijama, s
                dobavljačima koji su nam poznati po imenu. Manje otpada, dulji vijek trajanja i
                cijena koja odražava stvarni rad.
              </p>
              <Link to="/o-nama" className="btn-clay mt-8 self-start">
                Saznaj više
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="order-1 aspect-[4/3] lg:order-2 lg:aspect-auto">
              <ProductImage
                src={EDITORIAL_IMAGE}
                alt="Detalj tkanine u radionici"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* RECENZIJE */}
      <section className="container-page pb-4">
        <h2 className="text-center text-3xl sm:text-4xl">Što kažu kupci</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {REVIEWS.map((review) => (
            <figure key={review.name} className="card flex h-full flex-col p-6">
              <div className="flex gap-0.5 text-clay">
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon key={i} className="h-4 w-4" />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-ink-soft">
                „{review.quote}”
              </blockquote>
              <figcaption className="mt-5 border-t border-line pt-4 text-xs text-muted">
                {review.name} · {review.city}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </>
  );
}
