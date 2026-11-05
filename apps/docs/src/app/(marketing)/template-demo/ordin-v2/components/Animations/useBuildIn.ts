// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import type { RefObject } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "./reducedMotion";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Cards marked [data-ord-build] fade up in a diagonal wave
export function useBuildIn(root: RefObject<HTMLElement | null>, columns = 3) {
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const cards = gsap.utils.toArray<HTMLElement>("[data-ord-build]", root.current);
      if (!cards.length) return;
      gsap.fromTo(
        cards,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          // Row and column both push the start back
          delay: (i) => (Math.floor(i / columns) + (i % columns)) * 0.1,
          clearProps: "transform,opacity",
          scrollTrigger: { trigger: cards[0], start: "top 85%", once: true },
        },
      );
    },
    { scope: root },
  );
}
