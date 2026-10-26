// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "../Animations/reducedMotion";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const ReadingProgress = ({ targetId }: { targetId: string }) => {
  const barRef = useRef<HTMLDivElement | null>(null);

  useGSAP(() => {
    const target = document.getElementById(targetId);
    if (!barRef.current || !target || prefersReducedMotion()) return;

    gsap.fromTo(
      barRef.current,
      { scaleX: 0 },
      {
        scaleX: 1,
        ease: "none",
        scrollTrigger: { trigger: target, start: "top center", end: "bottom center", scrub: true },
      },
    );
  }, [targetId]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-90 h-0.5">
      <div ref={barRef} className="h-full w-full origin-left bg-(--mpx-accent) [transform:scaleX(0)]" />
    </div>
  );
};

export default ReadingProgress;
