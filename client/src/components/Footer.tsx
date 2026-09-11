import { Link } from 'react-router-dom';
import { ArrowRight } from './Icons';

const COLUMNS = [
  {
    title: 'Trgovina',
    links: [
      { to: '/trgovina?category=Majice', label: 'Majice' },
      { to: '/trgovina?category=Košulje', label: 'Košulje' },
      { to: '/trgovina?category=Haljine', label: 'Haljine' },
      { to: '/trgovina?category=Jakne', label: 'Jakne' },
    ],
  },
  {
    title: 'Informacije',
    links: [
      { to: '/o-nama', label: 'O nama' },
      { to: '/trgovina', label: 'Sve kolekcije' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-sand">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <p className="font-display text-2xl tracking-[0.2em]">ATELIER</p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-soft">
            Male serije, prirodni materijali i krojevi koji traju dulje od jedne sezone. Šijemo u
            Europi, u radionicama s kojima surađujemo godinama.
          </p>
          <div className="mt-6 flex max-w-sm items-center gap-2">
            <input
              type="email"
              placeholder="vaš@email.hr"
              aria-label="E-mail adresa za newsletter"
              className="input bg-white"
            />
            <button type="button" className="btn-primary px-5" aria-label="Pretplati se">
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 text-xs text-muted">Novosti o kolekcijama, bez neželjene pošte.</p>
        </div>

        {COLUMNS.map((column) => (
          <div key={column.title}>
            <p className="text-xs font-semibold tracking-widest text-ink uppercase">
              {column.title}
            </p>
            <ul className="mt-4 space-y-2.5">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-ink-soft transition-colors hover:text-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-line">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-6 text-xs text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} ATELIER d.o.o. Sva prava pridržana.</p>
          <p>Zagreb, Hrvatska · Plaćanje karticom putem Stripea</p>
        </div>
      </div>
    </footer>
  );
}
