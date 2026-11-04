// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Lines from "./Animations/Lines";
import { lineIn, useReveal, useScene } from "./Animations/scene";
import { prefersReducedMotion } from "./Animations/reducedMotion";
import { VeyButton } from "./Buttons";
import { cta } from "../content";

const CURVES = [
  { d: "M-40 860 C420 840 820 700 1060 480 C1220 330 1330 180 1480 60", w: 1.8, o: 1 },
  { d: "M-40 900 C460 880 880 760 1120 540 C1260 410 1360 280 1480 180", w: 1, o: 0.5 },
  { d: "M-40 820 C380 790 760 640 1000 420 C1160 270 1290 120 1460 -20", w: 1, o: 0.4 },
  { d: "M200 900 C600 880 980 800 1200 620 C1330 510 1410 420 1480 360", w: 0.8, o: 0.3 },
];

const POINTS = [
  [12, 94],
  [33, 88],
  [55, 74],
  [73, 53],
  [86, 35],
  [96, 17],
];

const Cta = () => {
  const ref = useRef<HTMLElement>(null);

  useScene(
    ref,
    (tl, { q, mobile }) => {
      if (!mobile) {
        tl.fromTo(
          q("[data-cta-panel]"),
          { clipPath: "inset(6vh 5vw 0vh 5vw round 6px)" },
          { clipPath: "inset(0vh 0vw 0vh 0vw round 0px)", duration: 1, ease: "power2.out" },
          0,
        );
      }
      tl.fromTo(q("[data-cta-curve]"), { drawSVG: "0%" }, { drawSVG: "100%", duration: 1.2, stagger: 0.1, ease: "power1.inOut" }, 0.1);
      tl.fromTo(q("[data-cta-point]"), { autoAlpha: 0, scale: 0 }, { autoAlpha: 1, scale: 1, duration: 0.3, stagger: 0.08 }, 0.9);
    },
    { start: "top bottom", scrub: 1, revealText: false },
  );

  useReveal(
    ref,
    (tl, { q }) => {
      lineIn(tl, q("[data-line]"), 0, 1.1);
      tl.fromTo(q("[data-cta-fade]"), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, stagger: 0.1 }, 0.4);
    },
    "top 55%",
  );

  useGSAP(
    () => {
      if (prefersReducedMotion() || !window.matchMedia("(hover: hover)").matches) return;
      const section = ref.current;
      if (!section) return;
      const points = Array.from(section.querySelectorAll<HTMLElement>("[data-cta-point-inner]"));
      const setters = points.map((p) => ({
        el: p,
        sx: gsap.quickTo(p, "scaleX", { duration: 0.5, ease: "power3.out" }),
        sy: gsap.quickTo(p, "scaleY", { duration: 0.5, ease: "power3.out" }),
        x: gsap.quickTo(p, "x", { duration: 0.8, ease: "power3.out" }),
        y: gsap.quickTo(p, "y", { duration: 0.8, ease: "power3.out" }),
      }));
      const onMove = (e: PointerEvent) => {
        setters.forEach((s) => {
          const r = s.el.getBoundingClientRect();
          const dx = e.clientX - (r.left + r.width / 2);
          const dy = e.clientY - (r.top + r.height / 2);
          const d = Math.hypot(dx, dy);
          const f = Math.max(0, 1 - d / 220);
          s.sx(1 + f * 1.6);
          s.sy(1 + f * 1.6);
          s.x(dx * f * 0.25);
          s.y(dy * f * 0.25);
        });
      };
      const onLeave = () => setters.forEach((s) => (s.sx(1), s.sy(1), s.x(0), s.y(0)));
      section.addEventListener("pointermove", onMove);
      section.addEventListener("pointerleave", onLeave);
      return () => {
        section.removeEventListener("pointermove", onMove);
        section.removeEventListener("pointerleave", onLeave);
      };
    },
    { scope: ref },
  );

  return (
    <section ref={ref} id="cta" aria-labelledby="cta-title" data-vey-tone="dark" className="relative bg-vey-paper">
      <div data-cta-panel className="relative overflow-hidden bg-[#0b1020] text-[#f5f6fa]">
        <div aria-hidden className="vey-glow pointer-events-none absolute right-[-15vw] top-[-20vh] h-[110vh] w-[80vw]" />
        <svg
          aria-hidden
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMaxYMax slice"
          className="pointer-events-none absolute inset-0 h-full w-full"
        >
          <defs>
            <linearGradient id="vey-cta-curve" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0" stopColor="#aeb8e8" stopOpacity="0" />
              <stop offset="0.5" stopColor="#aeb8e8" stopOpacity="0.7" />
              <stop offset="1" stopColor="#f5f6fa" />
            </linearGradient>
          </defs>
          {CURVES.map((c) => (
            <path
              strokeLinecap="round"
              key={c.d}
              data-cta-curve
              d={c.d}
              fill="none"
              stroke="url(#vey-cta-curve)"
              strokeOpacity={c.o}
              strokeWidth={c.w}
            />
          ))}
        </svg>
        <div aria-hidden className="pointer-events-none absolute inset-0 max-md:hidden">
          {POINTS.map(([x, y]) => (
            <span key={x} className="absolute h-0 w-0" style={{ left: `${x}%`, top: `${y}%` }}>
              <span data-cta-point className="absolute flex h-0 w-0 items-center justify-center">
                <span
                  data-cta-point-inner
                  className="absolute block h-[1vh] aspect-square rounded-full bg-[#e8eaf5] shadow-[0_0_14px_rgba(174,184,232,0.8)]"
                />
              </span>
            </span>
          ))}
        </div>

        <div className="relative flex min-h-svh flex-col justify-center gap-8 vey-container py-[20vh] max-md:py-[24vw]">
          <Lines id="cta-title" lines={cta.heading} className="w-[60%] max-lg:w-[85%] max-md:w-full" />
          <p data-cta-fade className="w-[34%] text-28 text-vey-dim max-lg:w-[60%] max-md:w-full">
            {cta.description}
          </p>
          <div data-cta-fade className="flex items-center gap-4 max-md:flex-col max-md:items-stretch">
            <VeyButton href={cta.primary.href}>{cta.primary.label}</VeyButton>
            <VeyButton href={cta.secondary.href} variant="ghost">
              {cta.secondary.label}
            </VeyButton>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Cta;
