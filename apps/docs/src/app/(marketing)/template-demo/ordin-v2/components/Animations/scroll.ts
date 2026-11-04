// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

export const SCRUB = 0.6;

export function scene(trigger: Element | null, start = "top 80%", end = "top 25%") {
  return gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger, start, end, scrub: SCRUB } });
}

export function ready(scope: Element | null) {
  scope?.querySelectorAll("[data-orn-split],[data-orn-fade]").forEach((el) => el.setAttribute("data-orn-ready", ""));
}

export function lines(tl: gsap.core.Timeline, target: Element | null, at: gsap.Position = 0) {
  if (!target) return null;
  const split = SplitText.create(target, { type: "lines", mask: "lines", linesClass: "orn-line" });
  target.setAttribute("data-orn-ready", "");
  tl.from(split.lines, { yPercent: 105, duration: 0.8, stagger: 0.12, ease: "power3.out" }, at);
  return split;
}

export function fade(tl: gsap.core.Timeline, targets: gsap.TweenTarget, at: gsap.Position = 0, stagger = 0.1, y = 24) {
  const els = gsap.utils.toArray<Element>(targets);
  if (!els.length) return;
  els.forEach((el) => el.setAttribute("data-orn-ready", ""));
  tl.from(els, { opacity: 0, y, duration: 0.6, stagger, ease: "power3.out" }, at);
}

export function draw(tl: gsap.core.Timeline, paths: gsap.TweenTarget, at: gsap.Position = 0, stagger = 0.12) {
  tl.fromTo(paths, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1, stagger, ease: "power2.inOut" }, at);
}

export function curve(x0: number, y0: number, x1: number, y1: number) {
  const dx = (x1 - x0) * 0.5;
  return `M${x0} ${y0} C${x0 + dx} ${y0}, ${x1 - dx} ${y1}, ${x1} ${y1}`;
}

export function useResizeKey() {
  const [key, setKey] = useState(0);
  useEffect(() => {
    let width = window.innerWidth;
    let timer = 0;
    const onResize = () => {
      if (window.innerWidth === width) return;
      width = window.innerWidth;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setKey((k) => k + 1), 200);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.clearTimeout(timer);
    };
  }, []);
  return key;
}
