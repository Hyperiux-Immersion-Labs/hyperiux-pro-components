// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { onIntroDone } from "./Animations/intro";
import { prefersReducedMotion } from "./Animations/reducedMotion";
import MintArc from "./MintArc";

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
      className="pointer-events-none absolute inset-x-0 top-0 z-0 h-screen [mask-image:linear-gradient(to_bottom,#000_55%,transparent_96%)]"
    >
      <div className="h-full w-full">
        <div className="h-full w-full max-md:opacity-50">
          <MintArc speed={1} flow={1} softness={0.95} />
        </div>
      </div>
    </div>
  );
};

export default HeroBackdrop;
