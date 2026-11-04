// Built using Hyperiux Vault: https://vault.hyperiux.com
"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(SplitText, ScrambleTextPlugin, ScrollTrigger);

type ScrambleTextProps = {
  text: string;
  className?: string;
  trigger?: "mount" | "scroll";
  triggerSelector?: string;
  start?: string;
  delay?: number;
  speed?: number;
  chars?: string;
  duration?: number;
  stagger?: number;
};

export default function ScrambleText({
  text,
  className = "",
  trigger = "scroll",
  triggerSelector,
  start = "top 85%",
  delay = 0,
  speed = 0.6,
  chars = "upperAndLowerCase",
  duration = 0.6,
  stagger = 0.03,
}: ScrambleTextProps) {
  const elRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let cancelled = false;
    let ctx: gsap.Context | null = null;

    const setup = async () => {
      try {
        await document.fonts?.ready;
      } catch {}
      if (cancelled || !elRef.current) return;

      ctx = gsap.context(() => {
        const el = elRef.current!;
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const tl = gsap.timeline({ paused: true, delay });

        if (reduced) {
          tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "power2.out" });
        } else {
          const split = SplitText.create(el, { type: "words,chars" });
          gsap.set(split.words, { display: "inline-block", whiteSpace: "nowrap" });
          const originals = split.chars.map((c) => c.textContent || "");
          gsap.set(split.chars, { opacity: 0 });
          gsap.set(el, { opacity: 1 });
          tl.to(split.chars, {
            duration,
            ease: "none",
            opacity: 1,
            stagger,
            scrambleText: { text: ((i: number) => originals[i]) as unknown as string, chars, speed, revealDelay: 0.2 },
          });
        }

        if (trigger === "mount") {
          tl.play();
          return;
        }
        ScrollTrigger.create({
          trigger: (triggerSelector && document.querySelector(triggerSelector)) || el,
          start,
          once: true,
          onEnter: () => tl.play(),
        });
      }, elRef);
    };

    setup();
    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [text, trigger, triggerSelector, start, delay, speed, chars, duration, stagger]);

  return (
    <span className={`relative inline-block ${className}`.trim()}>
      <span aria-hidden className="invisible">
        {text}
      </span>
      <span ref={elRef} aria-label={text} className="absolute inset-0 whitespace-nowrap opacity-0">
        {text}
      </span>
    </span>
  );
}
