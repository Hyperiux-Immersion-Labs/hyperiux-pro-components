// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { prefersReducedMotion } from "../Animations/reducedMotion";

gsap.registerPlugin(useGSAP);

type RollTextProps = {
  text: string;
  className?: string;
};

const RollText = ({ text, className = "" }: RollTextProps) => {
  const currentRef = useRef<HTMLSpanElement | null>(null);
  const previousRef = useRef<HTMLSpanElement | null>(null);
  const shownRef = useRef(text);

  useGSAP(
    () => {
      const current = currentRef.current;
      const previous = previousRef.current;
      if (!current || !previous || shownRef.current === text) return;

      previous.textContent = shownRef.current;
      shownRef.current = text;
      if (prefersReducedMotion()) {
        gsap.set(previous, { autoAlpha: 0 });
        return;
      }

      gsap.killTweensOf([current, previous]);
      gsap.set(previous, { autoAlpha: 1 });
      gsap.fromTo(previous, { yPercent: 0 }, { yPercent: -110, duration: 0.7, ease: "expo.out" });
      gsap.fromTo(
        current,
        { yPercent: 110 },
        { yPercent: 0, duration: 0.7, ease: "expo.out", onComplete: () => gsap.set(previous, { autoAlpha: 0 }) },
      );
    },
    { dependencies: [text] },
  );

  return (
    <span className={`grid overflow-hidden ${className}`.trim()}>
      <span ref={currentRef} className="col-start-1 row-start-1">
        {text}
      </span>
      <span ref={previousRef} aria-hidden className="invisible col-start-1 row-start-1" />
    </span>
  );
};

export default RollText;
