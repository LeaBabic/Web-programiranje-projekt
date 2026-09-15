import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../store/auth';
import {
  BoxIcon,
  CloseIcon,
  DashboardIcon,
  ExternalIcon,
  LogoutIcon,
  MenuIcon,
  OrdersIcon,
} from './Icons';

const NAV = [
  { to: '/', label: 'Nadzorna ploča', icon: DashboardIcon, end: true },
  { to: '/proizvodi', label: 'Proizvodi', icon: BoxIcon, end: false },
  { to: '/narudzbe', label: 'Narudžbe', icon: OrdersIcon, end: false },
];

const STORE_URL = 'http://localhost:5173';

export default function Layout() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);

  const sidebar = (
    <div className="flex h-full flex-col bg-sidebar text-white">
      <div className="flex h-16 items-center gap-2.5 px-6">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold">
          A
        </span>
        <div>
          <p className="text-sm font-semibold tracking-wide">ATELIER</p>
          <p className="text-[11px] text-white/50">Administracija</p>
        </div>
      </div>

      <nav className="mt-4 flex-1 space-y-1 px-3">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? 'bg-brand text-white'
                  : 'text-white/60 hover:bg-sidebar-soft hover:text-white'
              }`
            }
          >
            <Icon className="h-[18px] w-[18px]" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-1 px-3 pb-4">
        <a
          href={STORE_URL}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/60 transition-colors hover:bg-sidebar-soft hover:text-white"
        >
          <ExternalIcon className="h-[18px] w-[18px]" />
          Otvori trgovinu
        </a>

        <div className="mt-3 border-t border-white/10 pt-3">
          <div className="flex items-center gap-3 px-3 py-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-soft text-xs font-semibold">
              {user?.name.slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">{user?.name}</p>
              <p className="truncate text-[11px] text-white/40">{user?.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/60 transition-colors hover:bg-sidebar-soft hover:text-white"
          >
            <LogoutIcon className="h-[18px] w-[18px]" />
            Odjava
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      {/* Bočni izbornik — fiksan na širokim ekranima */}
      <aside className="sticky top-0 hidden h-screen lg:block">{sidebar}</aside>

      {/* Mobilni izbornik */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="absolute inset-y-0 left-0 w-72">{sidebar}</div>
        </div>
      )}

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-line bg-panel/90 px-4 backdrop-blur-sm lg:hidden">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-lg p-2 text-ink-soft hover:bg-canvas"
            aria-label="Izbornik"
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
          <span className="font-semibold">ATELIER admin</span>
        </header>

        <main className="animate-fade-up flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
