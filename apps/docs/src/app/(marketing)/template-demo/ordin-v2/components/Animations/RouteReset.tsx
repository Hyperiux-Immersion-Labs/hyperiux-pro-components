// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import { useLenis } from "lenis/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Each new page starts at the top, and every scroll trigger re-measures against the new layout
export default function RouteReset() {
  const pathname = usePathname();
  const lenis = useLenis();

  useLayoutEffect(() => {
    if (location.hash) return;
    window.scrollTo(0, 0);
    lenis?.scrollTo(0, { immediate: true, force: true });
    const frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(frame);
  }, [pathname, lenis]);

  return null;
}
