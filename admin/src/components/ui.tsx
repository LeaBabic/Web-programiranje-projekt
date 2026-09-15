import type { ReactNode } from 'react';
import { SpinnerIcon } from './Icons';
import { STATUS_LABELS, STATUS_STYLES, type OrderStatus } from '../types';

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export function Loading({ label = 'Učitavanje…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted">
      <SpinnerIcon className="h-6 w-6" />
      <p className="text-sm">{label}</p>
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
    info: 'border-line bg-canvas text-ink-soft',
  }[variant];

  return (
    <div role="alert" className={`rounded-lg border px-4 py-3 text-sm ${styles}`}>
      {children}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center gap-2 px-6 py-16 text-center">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="max-w-sm text-sm text-ink-soft">{description}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

/** Jednostavan modal za potvrdu nepovratnih radnji (npr. brisanje). */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Potvrdi',
  loading,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40" onClick={onCancel} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        className="card animate-fade-up relative w-full max-w-md p-6 shadow-xl"
      >
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-ink-soft">{description}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="btn-secondary">
            Odustani
          </button>
          <button type="button" onClick={onConfirm} disabled={loading} className="btn-danger">
            {loading ? <SpinnerIcon className="h-4 w-4" /> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Slika s rezervnim prikazom kada URL nije dostupan. */
export function Thumb({
  src,
  alt,
  className = 'h-12 w-12',
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <div className={`shrink-0 overflow-hidden rounded-lg bg-canvas ${className}`}>
      {src ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="h-full w-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.visibility = 'hidden';
          }}
        />
      ) : null}
    </div>
  );
}
