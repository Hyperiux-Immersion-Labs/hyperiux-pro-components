"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { X } from "lucide-react";

/**
 * Animated toast that slides up from the bottom-right.
 *
 * Props:
 *   show        - boolean controlling visibility
 *   onClose     - called when user dismisses or timer expires
 *   title       - bold line at the top
 *   description - secondary text below title (optional)
 *   ctaLabel    - text for the action button/link (optional)
 *   ctaHref     - if set, renders an <a>/<Link>; otherwise a <button>
 *   onCtaClick  - called when CTA is clicked (fires before navigation if ctaHref set)
 *   duration    - auto-dismiss in ms (default 5000, 0 = no auto-dismiss)
 *   variant     - "default" | "success" | "pro"
 */
export function VaultToast({
  show,
  onClose,
  title,
  description,
  ctaLabel,
  ctaHref,
  onCtaClick,
  duration = 5000,
  variant = "default",
}) {
  const timerRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    if (!show || duration === 0) return;

    // Animate the progress bar
    if (progressRef.current) {
      progressRef.current.style.transition = "none";
      progressRef.current.style.transform = "scaleX(1)";

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (progressRef.current) {
            progressRef.current.style.transition = `transform ${duration}ms linear`;
            progressRef.current.style.transform = "scaleX(0)";
          }
        });
      });
    }

    timerRef.current = setTimeout(onClose, duration);
    return () => clearTimeout(timerRef.current);
  }, [show, duration, onClose]);

  const handleCtaClick = () => {
    onCtaClick?.();
    onClose();
  };

  const borderColor =
    variant === "success"
      ? "border-emerald-400/25"
      : variant === "pro"
        ? "border-[#ff5f00]/25"
        : "border-white/10";

  const progressColor =
    variant === "success"
      ? "bg-emerald-400"
      : variant === "pro"
        ? "bg-[#ff5f00]"
        : "bg-white/40";

  const ctaClass =
    "inline-flex w-fit items-center gap-1.5 rounded-full bg-[#ff5f00] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#e05500] active:scale-95";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          role="alert"
          aria-live="polite"
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className={`fixed bottom-6 right-6 z-200 w-80 overflow-hidden rounded-2xl border bg-[#111] shadow-[0_24px_60px_rgba(0,0,0,0.5)] max-sm:bottom-4 max-sm:left-4 max-sm:right-4 max-sm:w-auto ${borderColor}`}
        >
          {/* Progress bar */}
          {duration > 0 && (
            <div className="h-[2px] w-full bg-white/5">
              <div
                ref={progressRef}
                className={`h-full origin-left ${progressColor}`}
                style={{ transform: "scaleX(1)" }}
              />
            </div>
          )}

          <div className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-semibold leading-snug text-white">
                  {title}
                </p>
                {description && (
                  <p className="text-xs leading-relaxed text-white/55">
                    {description}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Dismiss notification"
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white/30 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {ctaLabel && (
              <div className="mt-4">
                {ctaHref ? (
                  <Link href={ctaHref} className={ctaClass} onClick={handleCtaClick}>
                    {ctaLabel}
                  </Link>
                ) : (
                  <button type="button" className={ctaClass} onClick={handleCtaClick}>
                    {ctaLabel}
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
