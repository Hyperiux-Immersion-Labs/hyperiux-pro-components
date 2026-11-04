// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import type { RefObject } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

gsap.registerPlugin(useGSAP, ScrollTrigger, DrawSVGPlugin);

export const BREAKPOINTS = {
  desktop: "(min-width: 1026px)",
  tablet: "(min-width: 769px) and (max-width: 1025px)",
  mobile: "(max-width: 768px)",
  reduce: "(prefers-reduced-motion: reduce)",
};

export type SceneContext = {
  mobile: boolean;
  tablet: boolean;
  reduce: boolean;
  q: (selector: string) => Element[];
  el: HTMLElement;
};

type SceneOptions = {
  onUpdate?: (progress: number, ctx: SceneContext) => void;
  scrub?: number;
  start?: string;
  end?: string;
  revealText?: boolean;
};

function revealText(el: HTMLElement, mobile: boolean, reduce: boolean) {
  const lines = el.querySelectorAll("[data-line]");
  const descs = el.querySelectorAll("[data-desc]");
  if (!lines.length && !descs.length) return;
  const tl = gsap.timeline({ paused: true });
  if (lines.length) tl.fromTo(lines, { y: 0, yPercent: 115 }, { y: 0, yPercent: 0, duration: 1.1, stagger: 0.12, ease: "power3.out" }, 0);
  if (descs.length) tl.fromTo(descs, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power2.out" }, 0.35);
  if (reduce) {
    tl.progress(1);
    gsap.set(lines, { clearProps: "transform" });
    return;
  }
  ScrollTrigger.create({ trigger: el, start: mobile ? "top 82%" : "top 70%", once: true, onEnter: () => tl.play() });
}

export function useScene(
  ref: RefObject<HTMLElement | null>,
  build: (tl: gsap.core.Timeline, ctx: SceneContext) => void,
  options: SceneOptions = {},
) {
  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(BREAKPOINTS, (c) => {
        const { mobile, tablet, reduce } = c.conditions as Record<string, boolean>;
        const ctx: SceneContext = { mobile, tablet, reduce, q: gsap.utils.selector(el), el };
        if (options.revealText !== false) revealText(el, mobile, reduce);
        const tl = gsap.timeline({ paused: true, defaults: { ease: "none", duration: 1 } });
        build(tl, ctx);
        if (reduce) {
          tl.progress(1);
          options.onUpdate?.(1, ctx);
          return;
        }
        ScrollTrigger.create({
          trigger: el,
          start: mobile ? "top 80%" : (options.start ?? "top 85%"),
          end: mobile ? "bottom 85%" : (options.end ?? "bottom bottom"),
          scrub: mobile ? 0.6 : (options.scrub ?? 0.9),
          animation: tl,
          invalidateOnRefresh: true,
          onUpdate: options.onUpdate ? (self) => options.onUpdate?.(self.progress, ctx) : undefined,
        });
      });
    },
    { scope: ref },
  );
}

export function useReveal(
  ref: RefObject<HTMLElement | null>,
  build: (tl: gsap.core.Timeline, ctx: SceneContext) => void,
  start = "top 72%",
) {
  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(BREAKPOINTS, (c) => {
        const { mobile, tablet, reduce } = c.conditions as Record<string, boolean>;
        const ctx: SceneContext = { mobile, tablet, reduce, q: gsap.utils.selector(el), el };
        const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out", duration: 0.9 } });
        build(tl, ctx);
        if (reduce) {
          tl.progress(1);
          gsap.set(el.querySelectorAll("[data-line]"), { clearProps: "transform" });
          return;
        }
        ScrollTrigger.create({ trigger: el, start, once: true, onEnter: () => tl.play() });
      });
    },
    { scope: ref },
  );
}

export function lineIn(tl: gsap.core.Timeline, targets: gsap.TweenTarget, at: gsap.Position = 0, duration = 1) {
  return tl.fromTo(targets, { y: 0, yPercent: 115 }, { y: 0, yPercent: 0, duration, stagger: duration * 0.18, ease: "power3.out" }, at);
}

export function fadeIn(tl: gsap.core.Timeline, targets: gsap.TweenTarget, at: gsap.Position = 0, y = 24, duration = 1) {
  return tl.fromTo(targets, { autoAlpha: 0, y }, { autoAlpha: 1, y: 0, duration, ease: "power2.out" }, at);
}

export function draw(tl: gsap.core.Timeline, targets: gsap.TweenTarget, at: gsap.Position = 0, duration = 1) {
  return tl.fromTo(targets, { drawSVG: "0%" }, { drawSVG: "100%", duration, ease: "power1.inOut" }, at);
}

export function countUp(el: Element, value: number, decimals = 0, duration = 1.6) {
  const state = { v: 0 };
  return gsap.to(state, {
    v: value,
    duration,
    ease: "power2.out",
    onUpdate: () => {
      el.textContent = state.v.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    },
  });
}
