import { Link, Outlet, useNavigate } from 'react-router-dom';
import { UserIcon } from './Icons';
import { useAuth } from '../store/auth';

export default function Layout() {
  const navigate = useNavigate();
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);

  const odjava = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line bg-cream">
        <div className="container-page flex h-20 items-center justify-between">
          <Link to="/" className="font-display text-2xl tracking-tight">
            ATELIER
          </Link>

          <nav className="flex items-center gap-3 text-sm">
            {user ? (
              <>
                <span className="hidden items-center gap-2 text-ink-soft sm:flex">
                  <UserIcon className="h-4 w-4" />
                  {user.name}
                </span>
                <button type="button" onClick={odjava} className="btn-secondary">
                  Odjava
                </button>
              </>
            ) : (
              <>
                <Link to="/prijava" className="btn-secondary">
                  Prijava
                </Link>
                <Link to="/registracija" className="btn-primary">
                  Registracija
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-line bg-sand">
        <div className="container-page flex h-16 items-center text-xs text-muted">
          © {new Date().getFullYear()} ATELIER — projekt iz kolegija Web programiranje
        </div>
      </footer>
    </div>
  );
}
