// Built using Hyperiux Vault: https://vault.hyperiux.com
"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { prefersReducedMotion } from "../../Animations/reducedMotion";

gsap.registerPlugin(useGSAP);

export const LOADER_COUNTER_DURATION = 1.3;

// Adapted from the Number Counter effect's second digit-scroller variant.
const DIGITS = [...Array(10).keys(), 0];

type NumberCounterProps = {
  value?: string;
  duration?: number;
  stagger?: number;
};

export default function NumberCounter({
  value = "100",
  duration = 1.1,
  stagger = 0.1,
}: NumberCounterProps) {
  const rootRef = useRef<HTMLSpanElement | null>(null);

  useGSAP(() => {
    const columns = rootRef.current?.querySelectorAll<HTMLElement>("[data-counter-digit]");
    if (!columns) return;

    const reducedMotion = prefersReducedMotion();
    columns.forEach((column, index) => {
      const digit = Number(column.dataset.counterDigit);
      // Zero completes a full rotation so every loader digit rolls.
      const y = `${-(digit === 0 ? 10 : digit)}em`;
      if (reducedMotion) {
        gsap.set(column, { y });
        return;
      }
      gsap.fromTo(column, { y: "0em" }, {
        y,
        duration,
        delay: index * stagger,
        ease: "power2.inOut",
      });
    });
  }, { scope: rootRef, dependencies: [value, duration, stagger], revertOnUpdate: true });

  return (
    <span ref={rootRef} aria-label={value} className="inline-flex leading-none tabular-nums">
      {value.split("").map((digit, index) => /\d/.test(digit) ? (
        <span key={index} aria-hidden className="relative inline-flex h-[1em] w-[0.64em] overflow-hidden align-baseline leading-none">
          <span data-counter-digit={digit} className="flex flex-col">
            {DIGITS.map((number, digitIndex) => (
              <span key={digitIndex} className="flex h-[1em] shrink-0 items-center justify-center leading-none">
                {number}
              </span>
            ))}
          </span>
        </span>
      ) : <span key={index} aria-hidden>{digit}</span>)}
    </span>
  );
}
