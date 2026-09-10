import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { SpinnerIcon } from './Icons';

export function PageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="animate-fade-up">
      {eyebrow && (
        <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-clay uppercase">{eyebrow}</p>
      )}
      <h1 className="text-3xl sm:text-4xl">{title}</h1>
      {subtitle && <p className="mt-3 max-w-2xl text-ink-soft">{subtitle}</p>}
    </div>
  );
}

export function Loading({ label = 'Učitavanje…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted">
      <SpinnerIcon className="h-7 w-7" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4 lg:gap-x-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[3/4] rounded-2xl bg-sand" />
          <div className="mt-3.5 h-4 w-3/4 rounded bg-sand" />
          <div className="mt-2 h-3 w-1/3 rounded bg-sand" />
        </div>
      ))}
    </div>
  );
}

export function Alert({
  variant = 'error',
  children,
}: {
  variant?: 'error' | 'success' | 'info';
  children: ReactNode;
}) {
  const styles = {
    error: 'border-red-200 bg-red-50 text-red-800',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    info: 'border-line bg-sand text-ink-soft',
  }[variant];

  return (
    <div role="alert" className={`rounded-xl border px-4 py-3 text-sm ${styles}`}>
      {children}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionTo,
  icon,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-16 text-center">
      {icon && <div className="text-muted">{icon}</div>}
      <h3 className="text-xl">{title}</h3>
      <p className="max-w-sm text-sm text-ink-soft">{description}</p>
      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn-primary mt-3">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
