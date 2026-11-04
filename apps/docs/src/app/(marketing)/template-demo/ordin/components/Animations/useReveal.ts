// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import type { RefObject } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "./reducedMotion";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Fades every [data-ord-reveal] inside the section up into place as it scrolls into view
export function useReveal(root: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const items = gsap.utils.toArray<HTMLElement>("[data-ord-reveal]", root.current);
      gsap.set(items, { opacity: 0, y: 24 });
      ScrollTrigger.batch(items, {
        start: "top 88%",
        once: true,
        onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 1.1, stagger: 0.08, ease: "expo.out" }),
      });
    },
    { scope: root },
  );
}
