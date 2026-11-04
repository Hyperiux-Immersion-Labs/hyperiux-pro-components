// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { prefersReducedMotion } from "./reducedMotion";

gsap.registerPlugin(useGSAP);

export default function BeamFrame({ children, className = "" }: { children: ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const spin = gsap.to("[data-ord-beam-spin]", { rotate: 360, duration: 6, repeat: -1, ease: "none", paused: true });
      const io = new IntersectionObserver(([e]) => (e.isIntersecting ? spin.play() : spin.pause()));
      if (root.current) io.observe(root.current);
      return () => io.disconnect();
    },
    { scope: root },
  );

  return (
    <div ref={root} className={`relative overflow-hidden p-px ${className}`}>
      <span
        data-ord-beam-spin
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[220%] aspect-square -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_0deg,transparent_0deg,transparent_250deg,#73bea1_320deg,#6ef2b1_350deg,transparent_360deg)] will-change-transform"
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
}
