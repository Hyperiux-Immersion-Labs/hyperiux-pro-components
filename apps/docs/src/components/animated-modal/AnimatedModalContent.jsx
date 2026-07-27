
"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

const AnimatedModalContent = ({
  isOpen = false,
  onClose,
  children,
  className = "",
  contentClassName = "",
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEsc = true,
  closeButtonClassName = "",
  ariaLabel = "Dialog",
  ariaLabelledby,
}) => {
  const containerRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const container = containerRef.current;

    // Remember where focus was so we can restore it when the modal closes.
    previousFocusRef.current = document.activeElement;

    const getFocusable = () => {
      if (!container) return [];
      return Array.from(
        container.querySelectorAll(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => el.offsetParent !== null || el === document.activeElement);
    };

    // Move focus into the dialog on open (announces the dialog + its label).
    container?.focus();

    const handleKeyDown = (e) => {
      if (closeOnEsc && e.key === "Escape") {
        onClose?.();
        return;
      }

      if (e.key !== "Tab") return;

      // Trap focus: keep Tab / Shift+Tab cycling within the modal only.
      const items = getFocusable();
      if (items.length === 0) {
        e.preventDefault();
        container?.focus();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      const inside = container?.contains(active);

      if (e.shiftKey && (active === first || !inside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !inside)) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      // Return focus to whatever triggered the modal.
      previousFocusRef.current?.focus?.();
    };
  }, [isOpen, onClose, closeOnEsc]);

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabelledby ? undefined : ariaLabel}
      aria-labelledby={ariaLabelledby}
      tabIndex={-1}
      data-lenis-prevent

      {...(!isOpen ? { inert: true, "aria-hidden": "true" } : {})}
      className={`
        fixed inset-0 z-9999
        duration-500
        ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }
        ${className}
      `}
    >
      <button
        type="button"
        aria-label="Close modal"
        onClick={closeOnBackdrop ? onClose : undefined}
        className="
          absolute inset-0
          cursor-pointer border-0
          bg-black/82
          backdrop-blur-md
        "
      />

      {showCloseButton && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose?.();
          }}
          aria-label="Close modal"
          className={`
            absolute z-99999
            flex items-center justify-center
            rounded-full border-0
            bg-black/80 text-white
            cursor-pointer
            backdrop-blur-md
            transition-all duration-300
            hover:scale-[1.04]
            hover:bg-white/20
            pointer-events-auto
            touch-manipulation
            min-w-10 min-h-10

            top-[1.5vw] right-[1.5vw] w-[3vw] h-[3vw]
            max-md:top-8 max-md:right-8 max-md:w-14 max-md:h-14
            max-sm:top-4 max-sm:right-4 max-sm:w-10 max-sm:h-10

            ${closeButtonClassName}
          `}
        >
          <X size={24} className="pointer-events-none" />
        </button>
      )}

      <div
        className={`
          relative z-1
          flex h-screen w-screen items-center
          px-0

          max-md:px-0
          max-sm:justify-center max-sm:px-0

          ${contentClassName}
        `}
      >
        {children}
      </div>
    </div>
  );
};

export default AnimatedModalContent;
