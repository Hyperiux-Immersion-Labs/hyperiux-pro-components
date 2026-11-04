// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia?.(QUERY)?.matches === true;
}

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

export function useReducedMotion() {
  return useSyncExternalStore(subscribe, prefersReducedMotion, () => false);
}

export function viewportTier() {
  if (typeof window === "undefined") return "desktop";
  if (window.matchMedia("(max-width: 768px)").matches) return "mobile";
  if (window.matchMedia("(max-width: 1025px)").matches) return "tablet";
  return "desktop";
}
