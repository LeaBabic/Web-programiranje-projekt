import type { ReactNode } from 'react';

interface IconProps {
  className?: string;
}

const base = 'h-5 w-5';

const svg = (props: IconProps, children: ReactNode) => (
  <svg
    className={props.className ?? base}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

export const BagIcon = (p: IconProps) =>
  svg(
    p,
    <>
      <path d="M6 7h12l-1 13H7L6 7Z" />
      <path d="M9 7V6a3 3 0 0 1 6 0v1" />
    </>,
  );

export const UserIcon = (p: IconProps) =>
  svg(
    p,
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </>,
  );

export const SearchIcon = (p: IconProps) =>
  svg(
    p,
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </>,
  );

export const MenuIcon = (p: IconProps) =>
  svg(
    p,
    <>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </>,
  );

export const CloseIcon = (p: IconProps) =>
  svg(
    p,
    <>
      <path d="m6 6 12 12M18 6 6 18" />
    </>,
  );

export const ChevronRight = (p: IconProps) => svg(p, <path d="m9 5 7 7-7 7" />);
export const ChevronDown = (p: IconProps) => svg(p, <path d="m5 9 7 7 7-7" />);
export const ArrowRight = (p: IconProps) =>
  svg(
    p,
    <>
      <path d="M4 12h16" />
      <path d="m14 6 6 6-6 6" />
    </>,
  );

export const CheckIcon = (p: IconProps) => svg(p, <path d="m5 13 4 4L19 7" />);
export const TrashIcon = (p: IconProps) =>
  svg(
    p,
    <>
      <path d="M4 7h16" />
      <path d="M10 11v6M14 11v6" />
      <path d="M6 7l1 13h10l1-13" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </>,
  );

export const PlusIcon = (p: IconProps) => svg(p, <path d="M12 5v14M5 12h14" />);
export const MinusIcon = (p: IconProps) => svg(p, <path d="M5 12h14" />);

export const TruckIcon = (p: IconProps) =>
  svg(
    p,
    <>
      <path d="M3 7h11v9H3z" />
      <path d="M14 10h4l3 3v3h-7z" />
      <circle cx="7" cy="18" r="1.6" />
      <circle cx="17" cy="18" r="1.6" />
    </>,
  );

export const LeafIcon = (p: IconProps) =>
  svg(
    p,
    <>
      <path d="M5 19c0-8 5-13 14-13 0 9-5 13-14 13Z" />
      <path d="M9 15c1.5-3 3.5-5 7-6.5" />
    </>,
  );

export const ShieldIcon = (p: IconProps) =>
  svg(
    p,
    <>
      <path d="M12 3.5 19 6v6c0 4-3 7-7 8.5C8 19 5 16 5 12V6l7-2.5Z" />
      <path d="m9 12 2 2 4-4" />
    </>,
  );

export const ReturnIcon = (p: IconProps) =>
  svg(
    p,
    <>
      <path d="M4 10h11a5 5 0 0 1 0 10H9" />
      <path d="m8 6-4 4 4 4" />
    </>,
  );

export const StarIcon = (p: IconProps) => (
  <svg className={p.className ?? base} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="m12 3.5 2.6 5.6 6 .8-4.4 4.2 1.1 6-5.3-3-5.3 3 1.1-6L3.4 9.9l6-.8L12 3.5Z" />
  </svg>
);

export const SpinnerIcon = (p: IconProps) => (
  <svg className={`${p.className ?? base} animate-spin`} viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.2" fill="none" />
    <path
      d="M21 12a9 9 0 0 0-9-9"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);
