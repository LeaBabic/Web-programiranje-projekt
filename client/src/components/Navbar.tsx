import { useEffect, useState, type FormEvent } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { cartCount, useCart } from '../store/cart';
import { useAuth } from '../store/auth';
import { BagIcon, CloseIcon, MenuIcon, SearchIcon, UserIcon } from './Icons';

const LINKS = [
  { to: '/', label: 'Početna' },
  { to: '/trgovina', label: 'Trgovina' },
  { to: '/o-nama', label: 'O nama' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [search, setSearch] = useState('');
  const items = useCart((s) => s.items);
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const count = cartCount(items);

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    navigate(search.trim() ? `/trgovina?search=${encodeURIComponent(search.trim())}` : '/trgovina');
    setSearch('');
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `relative py-1 text-sm transition-colors after:absolute after:-bottom-0.5 after:left-0 after:h-px
     after:bg-ink after:transition-all ${
       isActive ? 'text-ink after:w-full' : 'text-ink-soft after:w-0 hover:text-ink hover:after:w-full'
     }`;

  return (
    <header className="sticky top-0 z-50">
      {/* Traka s obavijestima */}
      <div className="overflow-hidden bg-ink py-2 text-cream">
        <div className="flex w-max animate-marquee gap-12 whitespace-nowrap text-xs tracking-wider uppercase">
          {Array.from({ length: 2 }).map((_, block) => (
            <div key={block} className="flex gap-12">
              <span>Besplatna dostava iznad 80 €</span>
              <span>·</span>
              <span>Povrat u roku od 30 dana</span>
              <span>·</span>
              <span>Novo: kolekcija jesen / zima</span>
              <span>·</span>
              <span>Izrađeno od prirodnih materijala</span>
              <span>·</span>
            </div>
          ))}
        </div>
      </div>

      <nav
        className={`border-b transition-all duration-300 ${
          scrolled
            ? 'border-line bg-cream/90 backdrop-blur-md'
            : 'border-transparent bg-cream'
        }`}
      >
        <div className="container-page flex h-16 items-center justify-between gap-4 lg:h-20">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="-ml-2 rounded-full p-2 text-ink transition-colors hover:bg-sand md:hidden"
            aria-label={open ? 'Zatvori izbornik' : 'Otvori izbornik'}
            aria-expanded={open}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>

          <Link
            to="/"
            className="font-display text-2xl tracking-[0.2em] text-ink md:text-[1.6rem]"
            aria-label="ATELIER — početna"
          >
            ATELIER
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} className={linkClass} end={link.to === '/'}>
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <form onSubmit={submitSearch} className="hidden lg:block">
              <div className="relative">
                <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Pretraži…"
                  aria-label="Pretraži proizvode"
                  className="w-44 rounded-full border border-line bg-white/70 py-2 pr-3 pl-9 text-sm
                    transition-all placeholder:text-muted focus:w-56 focus:border-ink focus:outline-none"
                />
              </div>
            </form>

            {user ? (
              <div className="group relative">
                <div
                  className="flex items-center gap-2 rounded-full p-2 text-ink"
                  aria-label="Prijavljeni korisnik"
                >
                  <UserIcon />
                  <span className="hidden max-w-24 truncate text-sm xl:inline">
                    {user.name.split(' ')[0]}
                  </span>
                </div>
                <div
                  className="invisible absolute right-0 z-50 w-44 translate-y-1 rounded-xl border border-line
                    bg-white p-1.5 opacity-0 shadow-lg transition-all group-hover:visible
                    group-hover:translate-y-0 group-hover:opacity-100"
                >
                  <button
                    type="button"
                    onClick={logout}
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm text-ink-soft hover:bg-sand hover:text-ink"
                  >
                    Odjava
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/prijava"
                className="rounded-full p-2 text-ink transition-colors hover:bg-sand"
                aria-label="Prijava"
              >
                <UserIcon />
              </Link>
            )}

            <Link
              to="/kosarica"
              className="relative rounded-full p-2 text-ink transition-colors hover:bg-sand"
              aria-label={`Košarica, ${count} artikala`}
            >
              <BagIcon />
              {count > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 flex h-[18px] min-w-[18px] items-center justify-center
                    rounded-full bg-clay px-1 text-[10px] font-semibold text-cream"
                >
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobilni izbornik */}
        <div
          className={`overflow-hidden border-t border-line bg-cream transition-[max-height] duration-300 md:hidden ${
            open ? 'max-h-80' : 'max-h-0 border-transparent'
          }`}
        >
          <div className="container-page flex flex-col gap-1 py-4">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2.5 text-base ${isActive ? 'bg-sand text-ink' : 'text-ink-soft'}`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <form onSubmit={submitSearch} className="mt-2 flex gap-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Pretraži proizvode…"
                aria-label="Pretraži proizvode"
                className="input"
              />
              <button type="submit" className="btn-primary px-4" aria-label="Traži">
                <SearchIcon />
              </button>
            </form>
          </div>
        </div>
      </nav>
    </header>
  );
}
