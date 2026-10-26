// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true
  );
}

export function hasFinePointer() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(hover: hover) and (pointer: fine)")?.matches === true
  );
}
