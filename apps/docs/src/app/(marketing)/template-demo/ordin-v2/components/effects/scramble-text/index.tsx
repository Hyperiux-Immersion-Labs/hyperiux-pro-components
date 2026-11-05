// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useEffect, useRef, type ElementType } from "react";
import gsap from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrambleTextPlugin, ScrollTrigger);

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/_";

type ScrambleTextProps = {
  text: string;
  as?: ElementType;
  className?: string;
  start?: string;
  delay?: number;
  duration?: number;
  speed?: number;
  chars?: string;
  replayOnHover?: boolean;
};

export function scrambleTo(el: HTMLElement, text: string, duration = 0.8, chars = GLYPHS) {
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
    el.textContent = text;
    return;
  }
  gsap.to(el, { duration, ease: "none", scrambleText: { text, chars, speed: 0.6, revealDelay: duration * 0.25 } });
}

export default function ScrambleText({
  text,
  as,
  className = "",
  start = "top bottom",
  delay = 0,
  duration = 0.9,
  speed = 0.6,
  chars = GLYPHS,
  replayOnHover = false,
}: ScrambleTextProps) {
  const Tag = (as ?? "span") as any;
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return;

    const ctx = gsap.context(() => {
      gsap.set(el, { opacity: 0 });
      gsap.to(el, {
        opacity: 1,
        delay,
        duration,
        ease: "none",
        scrambleText: { text, chars, speed, revealDelay: duration * 0.3 },
        scrollTrigger: { trigger: el, start, once: true },
      });
    }, el);

    const onEnter = () => replayOnHover && scrambleTo(el, text, 0.6, chars);
    el.addEventListener("pointerenter", onEnter);

    return () => {
      el.removeEventListener("pointerenter", onEnter);
      ctx.revert();
      el.textContent = text;
    };
  }, [text, start, delay, duration, speed, chars, replayOnHover]);

  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {text}
    </Tag>
  );
}
