import { useState, type FormEvent } from 'react';
import { SpinnerIcon } from '../components/Icons';
import { Alert } from '../components/ui';
import { ApiError } from '../lib/api';
import { useAuth } from '../store/auth';

export default function Login() {
  const login = useAuth((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Prijava nije uspjela.');
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-sidebar p-4">
      <div className="animate-fade-up w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white">
            A
          </span>
          <div className="text-white">
            <p className="text-sm font-semibold tracking-wide">ATELIER</p>
            <p className="text-[11px] text-white/50">Administracija</p>
          </div>
        </div>

        <form onSubmit={submit} className="card space-y-4 p-6">
          <div>
            <h1 className="text-lg font-semibold">Prijava</h1>
            <p className="mt-1 text-sm text-ink-soft">Pristup imaju samo administratori.</p>
          </div>

          {error && <Alert>{error}</Alert>}

          <div>
            <label className="label" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              autoComplete="email"
              placeholder="admin@trgovina.hr"
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
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-white/40">
          Demo pristup: admin@trgovina.hr / admin123
        </p>
      </div>
    </div>
  );
}
