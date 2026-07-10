/**
 * True when the user has asked the OS to minimise animation.
 *
 * Safe to call during render or in a layout effect: returns false on the
 * server so the animated markup is what gets hydrated.
 */
export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;

  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}
