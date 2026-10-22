// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "../../Animations/reducedMotion";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type SquareTranslateProps = {
  children: ReactNode;
  className?: string;
  translateVw?: number;
  impact?: number;
  duration?: number;
  onActiveChange?: (index: number) => void;
};

const getTranslateProgress = (p: number) => {
  if (p < 0.1) return 0;
  if (p > 0.9) return 1;
  return (p - 0.1) / 0.8;
};

const SquareTranslate = ({
  children,
  className = "",
  translateVw = 3,
  impact = 3,
  duration = 0.4,
  onActiveChange,
}: SquareTranslateProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const squareRef = useRef<HTMLSpanElement | null>(null);
  const activeRef = useRef(onActiveChange);

  activeRef.current = onActiveChange;

  useGSAP(
    () => {
      const container = containerRef.current;
      const square = squareRef.current;
      if (!container || !square || prefersReducedMotion()) return;

      const rows = Array.from(
        container.querySelectorAll<HTMLElement>("[data-row]"),
      );
      const targets = rows.map((row) =>
        Array.from(row.querySelectorAll<HTMLElement>("[data-shift]")),
      );
      const all = targets.flat();
      let lastActive = -2;

      const reset = (index: number) => {
        gsap.to(all, {
          x: 0,
          duration: 0.6,
          ease: "power2.out",
          overwrite: true,
        });
        lastActive = index;
        activeRef.current?.(index);
      };

      const trigger = ScrollTrigger.create({
        trigger: container,
        start: "top 50%",
        end: "bottom 50%",
        scrub: true,
        onUpdate: ({ progress }) => {
          const shift = (window.innerWidth * translateVw) / 100;
          const current = getTranslateProgress(progress) * (rows.length - 1);
          const travel = container.offsetHeight - square.offsetHeight;

          gsap.to(square, {
            y: getTranslateProgress(progress) * travel,
            duration,
            ease: "power2.out",
            overwrite: true,
          });

          targets.forEach((group, i) => {
            gsap.to(group, {
              x: shift * (1 - Math.min(Math.abs(i - current) / impact, 1)),
              duration,
              ease: "power2.out",
              overwrite: true,
            });
          });

          const active = Math.round(current);
          if (active !== lastActive) {
            lastActive = active;
            activeRef.current?.(active);
          }
        },
        onLeave: () => reset(-1),
        onLeaveBack: () => reset(-1),
      });

      return () => trigger.kill();
    },
    { scope: containerRef, dependencies: [translateVw, impact, duration] },
  );

  return (
    <div ref={containerRef} className={`relative h-fit ${className}`.trim()}>
      <span
        aria-hidden
        className="pointer-events-none invisible absolute left-0 top-0 size-3"
        ref={squareRef}
      />
      {children}
    </div>
  );
};

export default SquareTranslate;
