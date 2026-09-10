import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, SpinnerIcon } from '../components/Icons';
import { Alert } from '../components/ui';
import { ApiError } from '../lib/api';
import { useAuth } from '../store/auth';

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, register } = useAuth();

  const [form, setForm] = useState({ name: '', email: '', password: '', repeat: '' });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const from = (location.state as { from?: string } | null)?.from ?? '/';

  if (user) return <Navigate to={from} replace />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (form.password !== form.repeat) {
      return setError('Lozinke se ne podudaraju.');
    }
    if (form.password.length < 6) {
      return setError('Lozinka mora imati barem 6 znakova.');
    }

    setSubmitting(true);
    try {
      await register(form.name, form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Registracija nije uspjela.');
      setSubmitting(false);
    }
  };

  return (
    <div className="container-page grid min-h-[70vh] items-center py-12">
      <div className="animate-fade-up mx-auto w-full max-w-md">
        <div className="text-center">
          <h1 className="text-3xl">Otvorite račun</h1>
          <p className="mt-2 text-sm text-ink-soft">
            Pratite narudžbe i spremite adresu za sljedeću kupnju.
          </p>
        </div>

        <form onSubmit={submit} className="card mt-8 space-y-4 p-6 sm:p-8">
          {error && <Alert>{error}</Alert>}

          <div>
            <label className="label" htmlFor="name">
              Ime i prezime
            </label>
            <input
              id="name"
              required
              minLength={2}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input"
              autoComplete="name"
              placeholder="Ana Anić"
            />
          </div>

          <div>
            <label className="label" htmlFor="email">
              E-mail adresa
            </label>
            <input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input"
              autoComplete="email"
              placeholder="vas@email.hr"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="password">
                Lozinka
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input"
                autoComplete="new-password"
                placeholder="Min. 6 znakova"
              />
            </div>
            <div>
              <label className="label" htmlFor="repeat">
                Ponovi lozinku
              </label>
              <input
                id="repeat"
                type="password"
                required
                value={form.repeat}
                onChange={(e) => setForm({ ...form, repeat: e.target.value })}
                className="input"
                autoComplete="new-password"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? <SpinnerIcon className="h-4 w-4" /> : 'Stvori račun'}
            {!submitting && <ArrowRight className="h-4 w-4" />}
          </button>

          <p className="text-center text-sm text-ink-soft">
            Već imate račun?{' '}
            <Link to="/prijava" className="font-medium text-ink underline underline-offset-4">
              Prijavite se
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
