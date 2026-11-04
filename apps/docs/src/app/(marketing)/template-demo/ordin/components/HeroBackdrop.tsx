// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { onIntroDone } from "./Animations/intro";
import { prefersReducedMotion } from "./Animations/reducedMotion";
import AuroraRibbon from "./effects/aurora-ribbon";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const HeroBackdrop = () => {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el || prefersReducedMotion()) return;
      gsap.to(el, {
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true },
      });
      return onIntroDone(() => {
        gsap.from(el.firstElementChild, { opacity: 0, duration: 2.4, ease: "expo.out" });
      });
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      data-ord-hide
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 z-0 h-screen [mask-image:linear-gradient(to_bottom,#000_70%,transparent)]"
    >
      <div className="h-full w-full">
        <div className="h-full w-full opacity-80 max-md:opacity-35">
        <AuroraRibbon
          backgroundColor="#0c1218"
          haloColor="#13605d"
          glowColor="#73bea1"
          coreColor="#d9f7e8"
          intensity={0.4}
          softness={1.15}
          speed={0.7}
          grain={0.05}
        />
        </div>
      </div>
    </div>
  );
};

export default HeroBackdrop;
