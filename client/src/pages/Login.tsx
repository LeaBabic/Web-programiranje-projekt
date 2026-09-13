import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, SpinnerIcon } from '../components/Icons';
import { Alert } from '../components/ui';
import { ApiError } from '../lib/api';
import { useAuth } from '../store/auth';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const from = (location.state as { from?: string } | null)?.from ?? '/profil';

  if (user) return <Navigate to={from} replace />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Prijava nije uspjela.');
      setSubmitting(false);
    }
  };

  return (
    <div className="container-page grid min-h-[70vh] items-center py-12">
      <div className="animate-fade-up mx-auto w-full max-w-md">
        <div className="text-center">
          <h1 className="text-3xl">Dobrodošli natrag</h1>
          <p className="mt-2 text-sm text-ink-soft">
            Prijavite se za pregled narudžbi i brže plaćanje.
          </p>
        </div>

        <form onSubmit={submit} className="card mt-8 space-y-4 p-6 sm:p-8">
          {error && <Alert>{error}</Alert>}

          <div>
            <label className="label" htmlFor="email">
              E-mail adresa
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              autoComplete="email"
              placeholder="vas@email.hr"
            />
          </div>

          <div>
            <label className="label" htmlFor="password">
              Lozinka
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? <SpinnerIcon className="h-4 w-4" /> : 'Prijavi se'}
            {!submitting && <ArrowRight className="h-4 w-4" />}
          </button>

          <p className="text-center text-sm text-ink-soft">
            Nemate račun?{' '}
            <Link to="/registracija" className="font-medium text-ink underline underline-offset-4">
              Registrirajte se
            </Link>
          </p>
        </form>

        <div className="mt-5 rounded-xl border border-dashed border-line px-4 py-3 text-center text-xs text-muted">
          Demo račun: <span className="text-ink">ana@primjer.hr</span> / lozinka{' '}
          <span className="text-ink">korisnik123</span>
        </div>
      </div>
    </div>
  );
}
