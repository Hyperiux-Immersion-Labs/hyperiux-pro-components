// Built using Hyperiux Vault: https://vault.hyperiux.com
"use client";

import type { ComponentPropsWithoutRef } from "react";
import gsap from "gsap";

const mulberry32 = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

type Reel = { copies: number; to: number; duration: number };

const buildReel = (charIndex: number, minCycles: number, cycleVariance: number, duration: number, variance: number): Reel => {
  const rand = mulberry32(charIndex * 1013 + 7);
  const cycles = minCycles + Math.floor(rand() * cycleVariance);
  return { copies: cycles + 1, to: cycles, duration: duration + rand() * variance };
};

type RollingTextProps = {
  text: string;
  className?: string;
  minCycles?: number;
  cycleVariance?: number;
  duration?: number;
  durationVariance?: number;
};

export function RollingText({
  text,
  className = "",
  minCycles = 1,
  cycleVariance = 2,
  duration = 0.55,
  durationVariance = 0.3,
}: RollingTextProps) {
  return (
    <span aria-hidden className={`inline-flex whitespace-nowrap leading-[1.2] ${className}`.trim()}>
      {text.split("").map((char, i) => {
        if (char === " ") {
          return (
            <span key={i} className="inline-block">
              &nbsp;
            </span>
          );
        }
        const reel = buildReel(i, minCycles, cycleVariance, duration, durationVariance);
        return (
          <span key={i} className="relative inline-block align-top">
            <span className="invisible block">{char}</span>
            <span className="absolute inset-0 overflow-hidden">
              <span
                data-reel=""
                data-to={reel.to}
                data-duration={reel.duration}
                className="block will-change-transform [transform:translate3d(0,calc(-1.2em*var(--k,0)),0)]"
              >
                {Array.from({ length: reel.copies }, (_, copy) => (
                  <span key={copy} className="block h-[1.2em] w-full text-center">
                    {char}
                  </span>
                ))}
              </span>
            </span>
          </span>
        );
      })}
    </span>
  );
}

type RollingLinkProps = { text: string; textClassName?: string } & Omit<ComponentPropsWithoutRef<"a">, "children">;

export default function RollingLink({ text, textClassName = "", onMouseEnter, onFocus, ...props }: RollingLinkProps) {
  const spin = (el: HTMLElement) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.querySelectorAll<HTMLElement>("[data-reel]").forEach((reel) => {
      const state = { k: 0 };
      gsap.to(state, {
        k: Number(reel.dataset.to),
        duration: Number(reel.dataset.duration),
        ease: "expo.out",
        overwrite: true,
        onUpdate: () => reel.style.setProperty("--k", String(state.k)),
        onComplete: () => reel.style.setProperty("--k", "0"),
      });
    });
  };

  return (
    <a
      aria-label={props["aria-label"] ?? text}
      {...props}
      onMouseEnter={(e) => {
        spin(e.currentTarget);
        onMouseEnter?.(e);
      }}
      onFocus={(e) => {
        spin(e.currentTarget);
        onFocus?.(e);
      }}
    >
      <RollingText text={text} className={textClassName} />
    </a>
  );
}
