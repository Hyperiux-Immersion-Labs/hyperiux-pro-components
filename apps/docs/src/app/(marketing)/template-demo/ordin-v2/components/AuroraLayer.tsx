// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { theme } from "../content";
import { prefersReducedMotion } from "./Animations/reducedMotion";
import AuroraRibbon from "./effects/aurora-ribbon";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const AuroraLayer = () => {
  const root = useRef<HTMLDivElement>(null);
  const drift = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const el = root.current;
    if (!el) return;
    let triggers: ScrollTrigger[] = [];
    const sync = () => {
      el.style.display = triggers.some((t) => t.isActive) ? "" : "none";
    };
    triggers = gsap.utils.toArray<HTMLElement>("[data-orn-aurora]").map((section) =>
      ScrollTrigger.create({ trigger: section, start: "top bottom", end: "bottom top", onToggle: sync }),
    );
    sync();
    ScrollTrigger.addEventListener("refresh", sync);

    if (!prefersReducedMotion()) {
      gsap.to(drift.current, { yPercent: -12, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: true } });
    }

    return () => ScrollTrigger.removeEventListener("refresh", sync);
  });

  return (
    <div ref={root} aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div ref={drift} className="h-[114vh] w-full opacity-90 max-md:opacity-70">
        <AuroraRibbon
          backgroundColor={theme.aurora.background}
          haloColor={theme.aurora.halo}
          glowColor={theme.aurora.glow}
          coreColor={theme.aurora.core}
          intensity={0.55}
          softness={1.2}
          speed={0.6}
          grain={0.04}
        />
      </div>
    </div>
  );
};

export default AuroraLayer;
