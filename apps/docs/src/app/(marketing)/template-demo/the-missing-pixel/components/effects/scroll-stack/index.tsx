// Built using Hyperiux Vault: https://vault.hyperiux.com
"use client";

import { Children, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "../../Animations/reducedMotion";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const TOPS = ["top-[15vh]", "top-[18vh]", "top-[21vh]", "top-[24vh]", "top-[27vh]", "top-[30vh]"];

type ScrollStackProps = {
  children: ReactNode;
  startScale?: number;
};

const ScrollStack = ({ children, startScale = 1.1 }: ScrollStackProps) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const items = Children.toArray(children);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      const mm = gsap.matchMedia();
      mm.add("(min-width: 769px)", () => {
        const cards = gsap.utils.toArray<HTMLElement>("[data-stack-card]", rootRef.current);
        gsap.set(cards.slice(1), { scale: startScale });

        cards.slice(0, -1).forEach((_, index) => {
          const next = cards[index + 1];
          gsap.to(next, {
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: next,
              start: "top bottom+=20%",
              end: `top top+=${15 + Math.min(index + 1, TOPS.length - 1) * 3}%`,
              scrub: true,
              invalidateOnRefresh: true,
            },
          });
        });
      });
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className="flex flex-col gap-[60vh] max-md:gap-6">
      {items.map((item, index) => (
        <div key={index} data-stack-card className={`sticky origin-center max-md:static ${TOPS[Math.min(index, TOPS.length - 1)]}`}>
          {item}
        </div>
      ))}
    </div>
  );
};

export default ScrollStack;
