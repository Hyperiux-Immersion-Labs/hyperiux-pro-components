// Built using Hyperiux Vault: https://vault.hyperiux.com

type IconProps = { className?: string; "data-arrow"?: boolean };

export const ArrowUpRight = ({ className = "", "data-arrow": dataArrow }: IconProps) => (
  <svg
    className={className}
    data-arrow={dataArrow}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M7 17 17 7M8.5 7H17v8.5" />
  </svg>
);

export const ArrowRight = ({ className = "" }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M4 12h16M14 6l6 6-6 6" />
  </svg>
);

const LOGO_CELLS = [
  [2, 6],
  [10, 6],
  [2, 14],
  [10, 14],
  [18, 14],
  [2, 22],
  [10, 22],
  [18, 22],
];

type LogoMarkProps = IconProps & { pixelRef?: (el: SVGRectElement | null) => void };

export const LogoMark = ({ className = "", pixelRef }: LogoMarkProps) => (
  <svg
    className={`overflow-visible ${className}`.trim()}
    viewBox="0 0 28 28"
    aria-hidden="true"
    focusable="false"
  >
    {LOGO_CELLS.map(([x, y]) => (
      <rect key={`${x}-${y}`} x={x} y={y} width="7" height="7" rx="1.2" fill="currentColor" />
    ))}
    <rect ref={pixelRef} x="21" y="0" width="7" height="7" rx="1.2" className="fill-(--mpx-accent)" />
  </svg>
);

export const Check = ({ className = "" }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);
