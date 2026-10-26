// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { prefersReducedMotion } from "../Animations/reducedMotion";

gsap.registerPlugin(useGSAP);

type StatusDotProps = {
  label: string;
  className?: string;
};

const StatusDot = ({ label, className = "" }: StatusDotProps) => {
  const pulseRef = useRef<HTMLSpanElement | null>(null);

  useGSAP(() => {
    const pulse = pulseRef.current;
    if (!pulse || prefersReducedMotion()) return;

    gsap.fromTo(
      pulse,
      { scale: 1, opacity: 0.6 },
      { scale: 3, opacity: 0, duration: 1.7, ease: "power3.out", repeat: -1, repeatDelay: 0.7 },
    );
  }, []);

  return (
    <span
      className={`inline-flex items-center gap-2 text-14 text-mpx-muted ${className}`.trim()}
    >
      <span aria-hidden className="relative size-[0.4vw] rounded-full bg-(--mpx-accent) max-lg:size-[1.2vw] max-md:size-[2vw]">
        <span ref={pulseRef} className="absolute inset-0 rounded-full bg-(--mpx-accent)" />
      </span>
      {label}
    </span>
  );
};

export default StatusDot;
