import { useState } from 'react';

interface Props {
  src: string;
  alt: string;
  className?: string;
}

/**
 * Slika proizvoda s rezervnim prikazom — ako se URL ne uspije učiti
 * (npr. obrisana datoteka ili nedostupan vanjski izvor), prikazuje se
 * neutralna pozadina umjesto slomljene ikone.
 */
export default function ProductImage({ src, alt, className }: Props) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={`flex items-center justify-center bg-sand text-muted ${className ?? ''}`}
        role="img"
        aria-label={alt}
      >
        <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="m5 16 4-4 3 3 3-3 4 4" />
          <circle cx="9" cy="9" r="1.4" />
        </svg>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
