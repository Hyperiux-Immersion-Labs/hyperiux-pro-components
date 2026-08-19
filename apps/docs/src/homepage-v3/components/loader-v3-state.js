"use client";

import { useEffect, useState } from "react";

export const LOADER_V3_COMPLETE_EVENT = "hyperiux-v3:loader-complete";
export const LOADER_V3_HANDOFF_EVENT = "hyperiux-v3:loader-handoff";

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

/**
 * The loader's mark has landed on the navbar's logo. Separate from "complete",
 * which fires when the exit *starts* so the hero can come up underneath: this
 * one is the moment the bar has to be there to take the mark over.
 */
export function markLoaderV3Handoff() {
  if (typeof window === "undefined") return;

  window.__HYPERIUX_V3_LOADER_HANDOFF__ = true;
  window.dispatchEvent(new CustomEvent(LOADER_V3_HANDOFF_EVENT));
}

export function isLoaderV3Complete() {
  return (
    typeof window !== "undefined" &&
    window.__HYPERIUX_V3_LOADER_COMPLETE__ === true
  );
}

export function isLoaderV3Handoff() {
  return (
    typeof window !== "undefined" &&
    window.__HYPERIUX_V3_LOADER_HANDOFF__ === true
  );
}

/**
 * True once the loader has cleared. Falls open after `fallbackMs` so a section
 * gated on this is never left hidden on a page where the loader isn't mounted
 * (or where it failed before dispatching).
 */
export function useLoaderV3Complete(fallbackMs = 6000) {
  return useLoaderFlag(LOADER_V3_COMPLETE_EVENT, isLoaderV3Complete, fallbackMs);
}

/**
 * True once the mark has landed. No fallback of its own — a page where the
 * handoff never happens (the burst exit, or no loader at all) has to fall back
 * on `useLoaderV3Complete`, which knows when it is safe to give up waiting.
 */
export function useLoaderV3Handoff() {
  return useLoaderFlag(LOADER_V3_HANDOFF_EVENT, isLoaderV3Handoff, Infinity);
}

function useLoaderFlag(event, isSet, fallbackMs) {
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const onFire = () => setSeen(true);

    window.addEventListener(event, onFire);
    // Already done before this mounted (or no loader on the page) — flip on the
    // next tick rather than synchronously inside the effect.
    const already = isSet();
    const fallback =
      already || Number.isFinite(fallbackMs)
        ? window.setTimeout(onFire, already ? 0 : fallbackMs)
        : 0;

    return () => {
      window.removeEventListener(event, onFire);
      window.clearTimeout(fallback);
    };
  }, [event, isSet, fallbackMs]);

  return seen;
}
