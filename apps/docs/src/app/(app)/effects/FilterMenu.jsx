"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { FILTER_OPTIONS } from "@/lib/effect-sort";

export { FILTER_OPTIONS };

export function FilterMenu({
  activeFilter,
  // Only needed by the "label" variant, where the button must always show
  // the true current selection (including "all") - activeFilter alone can't
  // do that since callers null it out to render the icon-only unselected
  // state. Unused by the vault listing's own <FilterMenu> calls, which never
  // pass this and stay on the default "icon" variant.
  categoryFilter,
  getLabel,
  onSelect,
  // Defaults to the vault listing's featured/free/pro/sort dropdown; the
  // Saved Effects / Usage dashboard tabs pass a longer list ("all" + these
  // + every category present) so one dropdown covers all filtering instead
  // of a separate chips row.
  options = FILTER_OPTIONS,
  // "icon" (default): vault listing's funnel icon, label only shown once a
  // filter/sort option is active. "label": always shows the current
  // selection as text + a chevron - used where the dropdown is the only
  // filter control (Saved Effects / Usage) instead of a decoration next to
  // a visible chips row.
  variant = "icon",
  // Extra classes merged onto the dropdown panel - e.g. a fixed height +
  // overflow-y-auto once the option list can outgrow the vault listing's
  // handful-of-items case this component was originally built for.
  panelClassName = "",
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hoveredCat, setHoveredCat] = useState(null);
  // On mobile/tablet the category row is a horizontal scroll container, which
  // clips an absolutely-positioned dropdown. When set, the menu is portaled to
  // <body> with these fixed viewport coords so it renders on top instead.
  const [menuPos, setMenuPos] = useState(null);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const panelRef = useRef(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setHoveredCat(null);
      return;
    }

    const handlePointerDown = (event) => {
      if (
        !menuRef.current?.contains(event.target) &&
        !panelRef.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    // The mobile/tablet panel is portaled with fixed coords, so close it on
    // scroll/resize rather than let it float detached from its button.
    // Registered with capture=true to catch page scroll wherever it
    // originates - but that also catches the panel's own internal scroll
    // (an option list long enough to need panelClassName's overflow-y-auto),
    // since capture-phase listeners on `window` see descendant scroll events
    // regardless of bubbling. Skip those so scrolling the list doesn't
    // instantly close it.
    const handleReposition = (event) => {
      if (panelRef.current?.contains(event.target)) return;
      setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleReposition, true);
    window.addEventListener("resize", handleReposition);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleReposition, true);
      window.removeEventListener("resize", handleReposition);
    };
  }, [open]);

  const handleToggle = () => {
    setOpen((isOpen) => {
      const next = !isOpen;

      if (
        next &&
        typeof window !== "undefined" &&
        window.innerWidth < 768
      ) {
        const rect = buttonRef.current?.getBoundingClientRect();

        if (rect) {
          setMenuPos({
            top: rect.bottom + 8,
            left: rect.left,
          });
        }
      } else {
        setMenuPos(null);
      }

      return next;
    });
  };

  const panel = open ? (
    <div
      ref={panelRef}
      role="menu"
      style={
        menuPos
          ? {
              top: menuPos.top,
              left: menuPos.left,
            }
          : undefined
      }
      className={[
        "space-y-1.5 min-w-44 rounded-md border border-white/10 bg-[#1a1a1a] p-1.5",
        menuPos ? "fixed z-[9999]" : "absolute left-0 top-full mt-2 z-30",
        panelClassName,
      ]
        .filter(Boolean)
        .join(" ")}
      onMouseLeave={() => setHoveredCat(null)}
    >
      <LayoutGroup id="filter-menu-pill">
        {options.map((cat) => {
          // categoryFilter (when passed, "label" variant) always reflects
          // the true current selection, including "all" - activeFilter
          // alone is null in that state so nothing would ever highlight.
          const isSelected = (categoryFilter ?? activeFilter) === cat;
          // Hover takes precedence; fall back to the active filter so the
          // pill still rests somewhere when nothing is hovered.
          const highlighted = hoveredCat
            ? hoveredCat === cat
            : isSelected;

          return (
            <button
              key={cat}
              type="button"
              role="menuitem"
              onMouseEnter={() => setHoveredCat(cat)}
              onClick={() => {
                onSelect(cat);
                setOpen(false);
              }}
              className="relative isolate flex w-full items-center rounded-full px-4 py-2.5 text-left text20 cursor-pointer"
            >
              {highlighted && (
                <motion.span
                  // Shared layoutId lets the pill slide between items
                  // instead of cross-fading in place.
                  layoutId={
                    reduceMotion ? undefined : "filter-menu-pill"
                  }
                  className="absolute inset-0 z-0 rounded-md bg-white"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  transition={
                    reduceMotion
                      ? { duration: 0.2, ease: "easeOut" }
                      : {
                          type: "spring",
                          stiffness: 500,
                          damping: 40,
                          opacity: { duration: 0.15 },
                        }
                  }
                />
              )}
              <span
                className={`relative z-10 leading-none transition-colors duration-200 ${
                  highlighted
                    ? "text-[#111111]"
                    : "text-foreground"
                }`}
              >
                {getLabel(cat)}
              </span>
            </button>
          );
        })}
      </LayoutGroup>
    </div>
  ) : null;

  return (
    <div ref={menuRef} className="relative shrink-0">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Filter effects"
        className={`
          px-6 py-2.5 text-md relative rounded-full max-md:px-5 max-md:py-2
          backdrop-blur-[6px] font-sans flex items-center gap-2 justify-center
          cursor-pointer transition-colors duration-300 max-md:text-lg text20
          ${
            activeFilter
              ? "bg-white text-[#111111] hover:bg-white"
              : "bg-[#272727] text-foreground hover:text-[#111111] hover:bg-white"
          }
        `}
      >
        {variant === "label" ? (
          <>
            <span className="leading-none">{getLabel(categoryFilter)}</span>
            <ChevronDown
              className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                open ? "rotate-180" : ""
              }`}
            />
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0"
            >
              <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
            </svg>
            {activeFilter ? (
              <span className="leading-none">{getLabel(activeFilter)}</span>
            ) : null}
          </>
        )}
      </button>

      {panel &&
        (menuPos && mounted
          ? createPortal(panel, document.body)
          : panel)}
    </div>
  );
}
