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
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

export const DashboardIcon = (p: IconProps) =>
  svg(
    p,
    <>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="10" width="7" height="11" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </>,
  );

export const BoxIcon = (p: IconProps) =>
  svg(
    p,
    <>
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
      <path d="m4 7.5 8 4.5 8-4.5" />
      <path d="M12 12v9" />
    </>,
  );

export const OrdersIcon = (p: IconProps) =>
  svg(
    p,
    <>
      <path d="M6 3h12l1 18H5L6 3Z" />
      <path d="M9 7h6M9 11h6M9 15h4" />
    </>,
  );

export const PlusIcon = (p: IconProps) => svg(p, <path d="M12 5v14M5 12h14" />);
export const CheckIcon = (p: IconProps) => svg(p, <path d="m5 13 4 4L19 7" />);
export const CloseIcon = (p: IconProps) => svg(p, <path d="m6 6 12 12M18 6 6 18" />);
export const ChevronLeft = (p: IconProps) => svg(p, <path d="m15 5-7 7 7 7" />);
export const ChevronDown = (p: IconProps) => svg(p, <path d="m5 9 7 7 7-7" />);
export const SearchIcon = (p: IconProps) =>
  svg(
    p,
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </>,
  );

export const EditIcon = (p: IconProps) =>
  svg(
    p,
    <>
      <path d="M4 20h4l10-10-4-4L4 16v4Z" />
      <path d="m13.5 6.5 4 4" />
    </>,
  );

export const TrashIcon = (p: IconProps) =>
  svg(
    p,
    <>
      <path d="M4 7h16" />
      <path d="M10 11v6M14 11v6" />
      <path d="m6 7 1 13h10l1-13" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </>,
  );

export const UploadIcon = (p: IconProps) =>
  svg(
    p,
    <>
      <path d="M12 16V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
    </>,
  );

export const LogoutIcon = (p: IconProps) =>
  svg(
    p,
    <>
      <path d="M14 4H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h8" />
      <path d="M18 12H10" />
      <path d="m15 9 3 3-3 3" />
    </>,
  );

export const MenuIcon = (p: IconProps) => svg(p, <path d="M4 7h16M4 12h16M4 17h16" />);
export const EuroIcon = (p: IconProps) =>
  svg(
    p,
    <>
      <path d="M16 6.5A6 6 0 0 0 7.5 12 6 6 0 0 0 16 17.5" />
      <path d="M4 10.5h8M4 13.5h8" />
    </>,
  );

export const UsersIcon = (p: IconProps) =>
  svg(
    p,
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 19a6 6 0 0 1 12 0" />
      <path d="M16 5.5a3.2 3.2 0 0 1 0 5.2M17 19a6 6 0 0 0-1.5-4" />
    </>,
  );

export const AlertIcon = (p: IconProps) =>
  svg(
    p,
    <>
      <path d="M12 4 2.5 20h19L12 4Z" />
      <path d="M12 10v4M12 17h.01" />
    </>,
  );

export const ExternalIcon = (p: IconProps) =>
  svg(
    p,
    <>
      <path d="M14 4h6v6" />
      <path d="M20 4 10 14" />
      <path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </>,
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
