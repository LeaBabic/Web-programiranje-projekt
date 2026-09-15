import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="font-display text-7xl text-clay">404</p>
      <h1 className="mt-4 text-3xl">Stranica nije pronađena</h1>
      <p className="mt-3 max-w-sm text-sm text-ink-soft">
        Poveznica koju ste otvorili ne postoji ili je premještena.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/" className="btn-primary">
          Natrag na početnu
        </Link>
        <Link to="/trgovina" className="btn-secondary">
          U trgovinu
        </Link>
      </div>
    </div>
  );
}
