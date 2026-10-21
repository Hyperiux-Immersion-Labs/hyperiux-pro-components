"use client";

// A light checkbox in the site's look: a white square with a hairline, orange when ticked,
// and the tick draws itself in (stroke-dashoffset). A real <input> under it keeps keyboard,
// focus and screen readers working. Reduced motion: the tick just appears.
export function Checkbox({ checked, onChange, disabled = false, label, title, className = "" }) {
  return (
    <span title={title} className={`relative inline-grid size-4.5 shrink-0 place-items-center ${disabled ? "cursor-not-allowed opacity-30" : "cursor-pointer"} ${className}`}>
      <input
        type="checkbox"
        aria-label={label}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="peer absolute inset-0 z-1 m-0 cursor-[inherit] appearance-none opacity-0"
      />
      <span
        aria-hidden="true"
        className="col-start-1 row-start-1 size-full bg-foreground ring-1 ring-inset ring-black/20 transition-[background-color,box-shadow] duration-200 peer-hover:ring-primary peer-checked:bg-primary peer-checked:ring-primary peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary"
      />
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        className="pointer-events-none col-start-1 row-start-1 size-3 text-white peer-checked:[&_path]:[stroke-dashoffset:0]"
      >
        <path
          d="M3 8.5 6.5 12 13 4.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="square"
          pathLength="1"
          className="[stroke-dasharray:1] [stroke-dashoffset:1] transition-[stroke-dashoffset] duration-300 ease-[cubic-bezier(.65,0,.35,1)] motion-reduce:transition-none"
        />
      </svg>
    </span>
  );
}
