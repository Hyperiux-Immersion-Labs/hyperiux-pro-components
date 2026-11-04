// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef, type ReactNode } from "react";
import { useMagnetic } from "./Animations/useMagnetic";

const VARIANTS = {
  solid: "bg-[#73bea1] text-[#0c1218] hover:bg-[#8fd0b6]",
  line: "border border-[#6ef2b1]/35 text-current hover:border-[#6ef2b1]",
  ink: "bg-[#0c1218] text-[#e6ece4] hover:bg-[#13605d]",
  inkLine: "border border-[#0c1218]/25 text-[#0c1218] hover:border-[#13605d]",
};

type ButtonProps = { href: string; children: ReactNode; variant?: keyof typeof VARIANTS; className?: string };

export function OrdButton({ href, children, variant = "solid", className = "" }: ButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  useMagnetic(ref, 0.22);
  useMagnetic(labelRef, 0.12);

  return (
    <a
      ref={ref}
      href={href}
      className={`group relative inline-flex h-[5.6vh] items-center gap-6 overflow-hidden rounded-xs px-[1.4vw] text-22 transition-colors duration-500 max-lg:h-[4.2vh] max-lg:px-[2.6vw] max-md:h-[6vh] max-md:gap-4 max-md:px-[5vw] ${VARIANTS[variant]} ${className}`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 origin-left bg-[linear-gradient(100deg,transparent_20%,rgba(255,255,255,0.18)_50%,transparent_80%)] [transform:translateX(-110%)] transition-transform duration-700 ease-[cubic-bezier(0.7,0,0.2,1)] group-hover:[transform:translateX(110%)]"
      />
      <span ref={labelRef} className="relative">
        {children}
      </span>
      <span className="relative block h-[1.4vh] aspect-square overflow-hidden max-lg:h-[1.1vh] max-md:h-[1.5vh]">
        {[0, 1].map((k) => (
          <svg
            key={k}
            aria-hidden
            viewBox="0 0 16 16"
            className={`absolute inset-0 h-full w-full transition-transform duration-500 ease-[cubic-bezier(0.7,0,0.2,1)] ${k ? "[transform:translate(-120%,120%)] group-hover:[transform:translate(0,0)]" : "group-hover:[transform:translate(120%,-120%)]"}`}
          >
            <path d="M3 13 13 3M5 3h8v8" fill="none" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        ))}
      </span>
    </a>
  );
}

export function OrdMark() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 32 32"
      className="h-[2.8vh] aspect-square max-lg:h-[2.2vh] max-md:h-[2.8vh]"
    >
      <circle cx="16" cy="16" r="14.5" fill="none" stroke="currentColor" strokeWidth="1" />
      <ellipse cx="16" cy="16" rx="14.5" ry="5.5" fill="none" stroke="currentColor" strokeWidth="1" />
      <circle cx="16" cy="16" r="3.5" fill="#73bea1" />
    </svg>
  );
}
