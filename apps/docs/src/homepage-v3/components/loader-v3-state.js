"use client";

import { useEffect, useState } from "react";

export const LOADER_V3_COMPLETE_EVENT = "hyperiux-v3:loader-complete";

/**
 * Announces the loader is out of the way. The flag is set alongside the event
 * so a section that mounts after the loader finished can still read the state
 * synchronously instead of waiting for an event that already fired.
 */
export function markLoaderV3Complete() {
  if (typeof window === "undefined") return;

  window.__HYPERIUX_V3_LOADER_COMPLETE__ = true;
  window.dispatchEvent(new CustomEvent(LOADER_V3_COMPLETE_EVENT));
}

export function isLoaderV3Complete() {
  return (
    typeof window !== "undefined" &&
    window.__HYPERIUX_V3_LOADER_COMPLETE__ === true
  );
}

/**
 * True once the loader has cleared. Falls open after `fallbackMs` so a section
 * gated on this is never left hidden on a page where the loader isn't mounted
 * (or where it failed before dispatching).
 */
export function useLoaderV3Complete(fallbackMs = 6000) {
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    const onComplete = () => setComplete(true);

    window.addEventListener(LOADER_V3_COMPLETE_EVENT, onComplete);
    // Already done before this mounted (or no loader on the page) — flip on the
    // next tick rather than synchronously inside the effect.
    const fallback = window.setTimeout(
      onComplete,
      isLoaderV3Complete() ? 0 : fallbackMs
    );

    return () => {
      window.removeEventListener(LOADER_V3_COMPLETE_EVENT, onComplete);
      window.clearTimeout(fallback);
    };
  }, [fallbackMs]);

  return complete;
}
