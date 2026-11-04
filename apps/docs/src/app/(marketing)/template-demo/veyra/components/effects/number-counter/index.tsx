// Built using Hyperiux Vault: https://vault.hyperiux.com
"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { memo, useEffect, useRef, useSyncExternalStore, type RefObject } from "react";

gsap.registerPlugin(ScrollTrigger);

const DIGITS = [...Array(10).keys()];
const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}

type DigitScrollerProps = {
  digit: string;
  index: number;
  duration: number;
  stagger: number;
  trigger: RefObject<HTMLSpanElement | null>;
  reducedMotion: boolean;
};

const DigitScroller = memo(({ digit, index, duration, stagger, trigger, reducedMotion }: DigitScrollerProps) => {
  const columnRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (reducedMotion || !columnRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        columnRef.current,
        { yPercent: 0 },
        {
          yPercent: -parseInt(digit, 10) * 10,
          duration,
          delay: index * stagger,
          ease: "power2.out",
          scrollTrigger: { trigger: trigger.current, start: "top 85%", once: true },
        },
      );
    });
    return () => ctx.revert();
  }, [digit, duration, index, stagger, trigger, reducedMotion]);

  if (reducedMotion) return <span className="inline-block">{digit}</span>;

  return (
    <span className="relative inline-block h-[1em] overflow-hidden leading-none">
      <span className="invisible">{digit}</span>
      <span ref={columnRef} className="absolute inset-x-0 top-0 flex flex-col">
        {DIGITS.map((d) => (
          <span key={d} className="flex h-[1em] items-center justify-center leading-none">
            {d}
          </span>
        ))}
      </span>
    </span>
  );
});

DigitScroller.displayName = "DigitScroller";

type NumberCounterProps = {
  value: string;
  className?: string;
  duration?: number;
  stagger?: number;
};

export default function NumberCounter({ value, className = "", duration = 1.6, stagger = 0.1 }: NumberCounterProps) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  return (
    <span ref={rootRef} className={`inline-flex items-baseline leading-none ${className}`}>
      <span className="sr-only">{value}</span>
      <span aria-hidden className="inline-flex items-baseline">
        {value
          .split("")
          .map((char, i) =>
            /\d/.test(char) ? (
              <DigitScroller
                key={`${i}-${char}`}
                digit={char}
                index={i}
                duration={duration}
                stagger={stagger}
                trigger={rootRef}
                reducedMotion={reducedMotion}
              />
            ) : (
              <span key={`${i}-${char}`}>{char}</span>
            ),
          )}
      </span>
    </span>
  );
}
