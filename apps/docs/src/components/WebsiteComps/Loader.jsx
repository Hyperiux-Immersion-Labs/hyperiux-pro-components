"use client";

import { useLayoutEffect } from "react";

// The full-screen intro animation was removed to test whether it was the
// cause of poor LCP/Speed Index/TBT scores on PageSpeed. Several other
// components (Navbar, NavbarMobile, Hero, RandomBlur, SplitLine,
// GlowingPlates) gate their own intro animations on "loader complete" —
// this shim satisfies that contract instantly instead of after a ~6s
// animation, so none of those components need to change.
export const LOADER_STORAGE_KEY = "hyperiux-loader-has-run";

export default function Loader() {
  useLayoutEffect(() => {
    try {
      window.sessionStorage.setItem(LOADER_STORAGE_KEY, "true");
    } catch (_) {}

    window.__HYPERIUX_LOADER_RUNNING__ = false;
    window.__HYPERIUX_LOADER_COMPLETE__ = true;
    document.body.classList.remove("loader-active");

    window.dispatchEvent(
      new CustomEvent("loaderComplete", { detail: { skipped: true } })
    );
    window.dispatchEvent(
      new CustomEvent("hyperiux:loader-complete", { detail: { skipped: true } })
    );
  }, []);

  return null;
}
