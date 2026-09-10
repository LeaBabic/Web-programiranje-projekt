import { Link } from 'react-router-dom';
import { ArrowRight } from '../components/Icons';
import { Loading } from '../components/ui';
import { useAuth } from '../store/auth';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) return <Loading />;

  return (
    <div className="container-page animate-fade-up py-20 lg:py-28">
      <div className="mx-auto max-w-xl text-center">
        <p className="text-xs tracking-[0.2em] text-muted uppercase">Web trgovina odjeće</p>
        <h1 className="mt-4 text-4xl sm:text-5xl">ATELIER</h1>

        {user ? (
          <>
            <p className="mt-5 text-ink-soft">
              Prijavljeni ste kao <span className="text-ink">{user.name}</span> ({user.email}).
            </p>
            <p className="mt-2 text-sm text-muted">
              Katalog proizvoda i košarica dolaze u sljedećim koracima izrade projekta.
            </p>
          </>
        ) : (
          <>
            <p className="mt-5 text-ink-soft">
              Otvorite račun ili se prijavite kako biste nastavili.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/registracija" className="btn-primary">
                Registracija
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/prijava" className="btn-secondary">
                Prijava
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
