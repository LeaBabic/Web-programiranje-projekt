import { Link } from 'react-router-dom';
import { ArrowRight, LeafIcon, ShieldIcon, TruckIcon } from '../components/Icons';
import ProductImage from '../components/ProductImage';

const HERO =
  'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1400&q=80';
const WORKSHOP =
  'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80';
const FABRIC =
  'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1000&q=80';

const VALUES = [
  {
    icon: LeafIcon,
    title: 'Materijali prije svega',
    text: 'Organski pamuk, europski lan i merino vuna. Nikad miješane sintetike koje se raspadnu nakon deset pranja.',
  },
  {
    icon: ShieldIcon,
    title: 'Poštena proizvodnja',
    text: 'Šijemo u malim obiteljskim radionicama u Hrvatskoj, Portugalu i Italiji. Sve partnere posjećujemo osobno.',
  },
  {
    icon: TruckIcon,
    title: 'Male serije',
    text: 'Proizvodimo koliko realno možemo prodati. Bez sezonskih viškova koji završe na otpadu.',
  },
];

const TIMELINE = [
  { year: '2019.', title: 'Prva radionica', text: 'Počeli smo s jednim krojem majice i posuđenom šivaćom mašinom u Zagrebu.' },
  { year: '2021.', title: 'Prva trgovina', text: 'Otvorili smo prostor u Ilici i upoznali kupce koji su nam postali savjetnici.' },
  { year: '2023.', title: 'Europski partneri', text: 'Povezali smo se s tkaonicama u Portugalu i prešli na certificirani lan.' },
  { year: '2026.', title: 'Online i dalje', text: 'Danas šaljemo u cijelu Europu, a i dalje znamo ime svake švelje s kojom radimo.' },
];

export default function About() {
  return (
    <>
      <section className="container-page py-10 lg:py-16">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="animate-fade-up">
            <p className="text-xs font-semibold tracking-[0.25em] text-clay uppercase">O nama</p>
            <h1 className="mt-4 text-4xl leading-tight sm:text-5xl">
              Sedam godina istog
              <br />
              jednostavnog pravila.
            </h1>
            <p className="mt-6 text-base leading-relaxed text-ink-soft">
              ATELIER je nastao iz frustracije: htjeli smo bijelu majicu koja neće posiviti nakon
              mjesec dana. Nismo je našli, pa smo je sašili sami. Danas radimo isto — samo s više
              krojeva i istim tvrdoglavim inzistiranjem na kvaliteti tkanine.
            </p>
            <p className="mt-4 text-base leading-relaxed text-ink-soft">
              Ne prodajemo trendove. Prodajemo komade koje ćete nositi i za pet godina, i to je
              jedina metrika koja nas zanima.
            </p>
            <Link to="/trgovina" className="btn-primary mt-8">
              Pogledaj kolekciju
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="animate-fade-up aspect-[4/5] overflow-hidden rounded-[2rem] bg-sand">
            <ProductImage src={HERO} alt="Naša radionica" className="h-full w-full object-cover" />
          </div>
        </div>
      </section>

      {/* VRIJEDNOSTI */}
      <section className="border-y border-line bg-sand">
        <div className="container-page py-16">
          <h2 className="text-3xl sm:text-4xl">U što vjerujemo</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {VALUES.map(({ icon: Icon, title, text }) => (
              <div key={title}>
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-cream text-clay">
                  <Icon />
                </div>
                <h3 className="mt-4 text-xl">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SLIKE + TEKST */}
      <section className="container-page py-16 lg:py-20">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-sand">
            <ProductImage src={WORKSHOP} alt="Rad u radionici" className="h-full w-full object-cover" />
          </div>
          <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-sand">
            <ProductImage src={FABRIC} alt="Uzorci tkanine" className="h-full w-full object-cover" />
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-3xl sm:text-4xl">Kako smo dovde stigli</h2>
          <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {TIMELINE.map((item) => (
              <li key={item.year} className="border-t border-line pt-5">
                <p className="font-display text-2xl text-clay">{item.year}</p>
                <h3 className="mt-2 text-lg">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{item.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page pb-8">
        <div className="rounded-[2rem] bg-ink px-8 py-14 text-center text-cream sm:px-12">
          <h2 className="text-3xl sm:text-4xl">Imate pitanje?</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-cream/70">
            Pišite nam na <span className="text-cream">podrska@atelier.hr</span> — odgovaramo isti
            radni dan, i to ljudi, ne roboti.
          </p>
          <Link to="/trgovina" className="btn-clay mt-8">
            Istraži kolekciju
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
