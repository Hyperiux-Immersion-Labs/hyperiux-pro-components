// Phones and tablets show and hide their address bar and toolbars as the page scrolls,
// which changes the viewport height (and fires window "resize") mid-scroll. Anything
// sized to that live height re-lays out and the page jumps. These helpers keep effects
// and the smooth scroll out of it.

const TOUCH_ONLY_QUERY = "(hover: none) and (pointer: coarse)";

/**
 * True on touch-only devices (phones, tablets without a trackpad). False on the
 * server and on anything with a fine pointer, laptops with touch screens included.
 */
export function isTouchOnlyDevice() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.(TOUCH_ONLY_QUERY)?.matches ?? false;
}

/**
 * window "resize", minus the height-only resizes from a touch browser's bars: on
 * touch-only devices the callback runs only when the width changes (rotation, split
 * screen), the same rule GSAP ScrollTrigger's ignoreMobileResize uses. Returns the
 * cleanup.
 */
export function onViewportResize(callback) {
  let lastWidth = window.innerWidth;
  const handler = (event) => {
    if (isTouchOnlyDevice() && window.innerWidth === lastWidth) return;
    lastWidth = window.innerWidth;
    callback(event);
  };
  window.addEventListener("resize", handler);
  return () => window.removeEventListener("resize", handler);
}
