"use client";

const POSITION_CLASSES = {
  // "top" clips inside containers with overflow-hidden/auto when the
  // trigger sits near the container's top edge (e.g. a code block's sticky
  // header) - use "bottom" there instead.
  top: "-top-9 left-1/2 -translate-x-1/2",
  bottom: "-bottom-9 left-1/2 -translate-x-1/2",
};

// Named group (group/tooltip) so hover state doesn't clash with the card's
// own `group` used for the hover-reveal of the whole icon row. Desktop-only:
// the icon row is already always-visible on touch breakpoints, where hover
// has no real meaning.
export function Tooltip({ label, children, className = "", position = "top" }) {
  return (
    <span className={`group/tooltip relative inline-flex ${className}`}>
      {children}

      <span
        role="tooltip"
        className={`pointer-events-none absolute z-10 whitespace-nowrap rounded-full bg-[#0e0e0e] border border-white/10 px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-200 max-md:hidden max-[1025px]:hidden group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100 ${
          POSITION_CLASSES[position] || POSITION_CLASSES.top
        }`}
      >
        {label}
      </span>
    </span>
  );
}
