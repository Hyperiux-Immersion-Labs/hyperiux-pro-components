// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lines from "./Animations/Lines";
import { lineIn, useReveal } from "./Animations/scene";
import { prefersReducedMotion } from "./Animations/reducedMotion";
import DottedGrid from "./effects/dotted-grid";
import { Arrow, Icon } from "./Icons";
import { features } from "../content";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const ENTRANCE = [
  { y: 70, rotate: -1.5, at: 0.2 },
  { y: 110, rotate: 1, at: 0.36 },
  { y: 50, rotate: -0.6, at: 0.28 },
  { y: 90, rotate: 1.4, at: 0.46 },
];

const BARS = [34, 48, 42, 60, 72, 88];
const SPARK = (x: number, y: number) => `M${x} ${y}c.5 3.6 2.7 5.8 7 7-4.3 1.2-6.5 3.4-7 7-.5-3.6-2.7-5.8-7-7 4.3-1.2 6.5-3.4 7-7Z`;

function FeatureArt({ kind }: { kind: number }) {
  if (kind === 0)
    return (
      <svg viewBox="0 0 220 110" aria-hidden className="h-full w-full overflow-visible">
        <path d="M56 55 H86 M126 55 H136" stroke="#e2e4ec" strokeWidth="1.5" />
        <path data-art-draw d="M166 55 H174" stroke="#aeb8e8" strokeWidth="1.5" pathLength={1} strokeDasharray="1" strokeDashoffset="1" />
        {[16, 86].map((x) => (
          <rect key={x} x={x} y="40" width="40" height="30" rx="8" fill="#f7f7f5" stroke="#e2e4ec" />
        ))}
        <rect x="126" y="40" width="40" height="30" rx="8" fill="#e8eaf5" stroke="#aeb8e8" />
        <path d="M28 55h16M98 55h16M138 55h16" stroke="#73798a" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        <g data-art-pop opacity="0">
          <rect x="174" y="40" width="40" height="30" rx="8" fill="#151927" />
          <path d={SPARK(194, 48)} fill="#aeb8e8" />
        </g>
      </svg>
    );
  if (kind === 1)
    return (
      <svg viewBox="0 0 220 110" aria-hidden className="h-full w-full overflow-visible">
        <path d="M20 50 H200" stroke="#e2e4ec" strokeWidth="1.5" strokeDasharray="3 5" />
        <path data-art-draw d="M20 50 H200" stroke="#aeb8e8" strokeWidth="1.5" pathLength={1} strokeDasharray="1" strokeDashoffset="1" />
        {[40, 110, 180].map((x, i) => (
          <g key={x}>
            <circle cx={x} cy="50" r="13" fill="#ffffff" stroke="#e2e4ec" />
            <circle data-art-check cx={x} cy="50" r="13" fill="#202b4a" opacity="0" />
            <path
              data-art-check
              d={`M${x - 5} 50.5l3.5 3.5 6.5-7`}
              stroke="#f5f6fa"
              strokeWidth="1.8"
              fill="none"
              strokeLinecap="round"
              opacity="0"
            />
            <text x={x} y="84" textAnchor="middle" fontSize="9" fill="#73798a">
              {["Trigger", "Process", "Notify"][i]}
            </text>
          </g>
        ))}
        <circle data-art-dot cx="20" cy="50" r="4" fill="#aeb8e8" />
      </svg>
    );
  if (kind === 2)
    return (
      <svg viewBox="0 0 220 110" aria-hidden className="h-full w-full overflow-visible">
        {[22, 55, 88].map((y) => (
          <g key={y}>
            <path d={`M44 ${y} C80 ${y} 80 55 96 55`} stroke="#e2e4ec" strokeWidth="1.5" fill="none" />
            <path
              data-art-draw
              d={`M44 ${y} C80 ${y} 80 55 96 55`}
              stroke="#aeb8e8"
              strokeWidth="1.5"
              fill="none"
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset="1"
            />
            <rect x="16" y={y - 11} width="28" height="22" rx="6" fill="#ffffff" stroke="#e2e4ec" />
          </g>
        ))}
        <path d="M124 55 H168" stroke="#e2e4ec" strokeWidth="1.5" />
        <path data-art-draw d="M124 55 H168" stroke="#aeb8e8" strokeWidth="1.5" pathLength={1} strokeDasharray="1" strokeDashoffset="1" />
        <rect x="96" y="41" width="28" height="28" rx="8" fill="#151927" />
        <path d={SPARK(110, 48)} fill="#aeb8e8" />
        <rect x="168" y="38" width="36" height="34" rx="8" fill="#e8eaf5" stroke="#aeb8e8" />
        <path d="M178 51h16M178 59h10" stroke="#202b4a" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  return (
    <svg viewBox="0 0 220 110" aria-hidden className="h-full w-full overflow-visible">
      <path d="M16 96 H204" stroke="#e2e4ec" strokeWidth="1.5" />
      {BARS.map((h, i) => (
        <rect
          key={i}
          data-art-bar
          x={24 + i * 30}
          y={96 - h}
          width="18"
          height={h}
          rx="4"
          fill={i === BARS.length - 1 ? "#202b4a" : "#e8eaf5"}
          stroke={i === BARS.length - 1 ? "none" : "#aeb8e8"}
          strokeOpacity="0.6"
        />
      ))}
      <path
        data-art-draw
        d="M33 54 L63 42 L93 48 L123 30 L153 18 L183 2"
        stroke="#202b4a"
        strokeWidth="1.5"
        fill="none"
        pathLength={1}
        strokeDasharray="1"
        strokeDashoffset="1"
      />
    </svg>
  );
}

const Features = () => {
  const ref = useRef<HTMLElement>(null);

  useReveal(ref, (tl, { q, mobile }) => {
    lineIn(tl, q("[data-line]"), 0, 1);
    tl.fromTo(q("[data-dots]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.6, ease: "power1.out" }, 0);
    q("[data-feature]").forEach((card, i) => {
      const e = ENTRANCE[i % ENTRANCE.length];
      tl.fromTo(
        card,
        { autoAlpha: 0, y: mobile ? 40 : e.y, rotate: mobile ? 0 : e.rotate },
        { autoAlpha: 1, y: 0, rotate: 0, duration: 1.1, ease: "power3.out" },
        mobile ? 0.2 + i * 0.1 : e.at,
      );
      tl.fromTo(
        card.querySelector("[data-feature-icon]"),
        { scale: 0.6, autoAlpha: 0 },
        { scale: 1, autoAlpha: 1, duration: 0.6, ease: "back.out(2)" },
        (mobile ? 0.2 + i * 0.1 : e.at) + 0.4,
      );
    });
  });

  useGSAP(
    (_, contextSafe) => {
      if (prefersReducedMotion() || !contextSafe) return;
      const canHover = window.matchMedia("(hover: hover)").matches;
      const cleanups: (() => void)[] = [];
      gsap.utils.toArray<HTMLElement>("[data-feature-link]", ref.current).forEach((card) => {
        const q = gsap.utils.selector(card);
        const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.out" } });
        const has = (sel: string) => q(sel).length > 0;
        if (has("[data-art-draw]")) tl.to(q("[data-art-draw]"), { strokeDashoffset: 0, duration: 0.7, stagger: 0.08 }, 0);
        if (has("[data-art-pop]")) tl.fromTo(q("[data-art-pop]"), { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 0.45 }, 0.4);
        if (has("[data-art-dot]")) tl.to(q("[data-art-dot]"), { attr: { cx: 200 }, duration: 1, ease: "power1.inOut" }, 0);
        if (has("[data-art-check]")) tl.to(q("[data-art-check]"), { opacity: 1, duration: 0.25, stagger: 0.15 }, 0.15);
        if (has("[data-art-bar]"))
          tl.fromTo(q("[data-art-bar]"), { scaleY: 1 }, { scaleY: 1.18, transformOrigin: "50% 100%", duration: 0.5, stagger: 0.05 }, 0);
        if (!canHover) {
          const st = ScrollTrigger.create({ trigger: card, start: "top 70%", once: true, onEnter: () => tl.play() });
          cleanups.push(() => st.kill());
          return;
        }
        const enter = contextSafe(() => tl.timeScale(1).play());
        const leave = contextSafe(() => tl.timeScale(1.6).reverse());
        card.addEventListener("pointerenter", enter);
        card.addEventListener("pointerleave", leave);
        card.addEventListener("focus", enter);
        card.addEventListener("blur", leave);
        cleanups.push(() => {
          card.removeEventListener("pointerenter", enter);
          card.removeEventListener("pointerleave", leave);
          card.removeEventListener("focus", enter);
          card.removeEventListener("blur", leave);
        });
      });
      return () => cleanups.forEach((c) => c());
    },
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      id="features"
      aria-labelledby="features-title"
      data-vey-tone="light"
      className="relative overflow-hidden bg-vey-paper text-vey-ink"
    >
      <div
        data-dots
        aria-hidden
        className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_60%,black_20%,transparent_75%)]"
      >
        <DottedGrid />
      </div>

      <div className="relative flex flex-col gap-16 vey-container vey-section max-md:gap-10">
        <Lines id="features-title" lines={features.heading} className="w-[50%] max-lg:w-[80%] max-md:w-full" />

        <ul className="grid grid-cols-4 items-start gap-5 max-lg:grid-cols-2 max-md:grid-cols-1">
          {features.items.map((item, i) => (
            <li key={item.title} data-feature>
              <a
                href="#dashboard"
                data-feature-link
                className="group relative flex h-[50vh] flex-col justify-between gap-6 overflow-hidden rounded-md border border-[#e2e4ec] bg-white px-[1.8vw] py-[1.8vw] transition-[border-color,background-color,transform] duration-500 hover:-translate-y-1.5 hover:border-[#aeb8e8] hover:bg-[#fbfbfd] max-lg:h-[40vh] max-lg:px-[3.4vw] max-lg:py-[3.4vw] max-md:h-auto max-md:px-[6vw] max-md:py-[6vw]"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-[#e8eaf5] to-[#e8eaf5]/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
                <div className="relative flex items-start justify-between">
                  <span
                    data-feature-icon
                    className="flex h-[6.4vh] aspect-square items-center justify-center rounded-md border border-[#e2e4ec] bg-[#f7f7f5] text-[#151927] transition-colors duration-500 group-hover:border-[#aeb8e8] group-hover:bg-[#aeb8e8] max-lg:h-[4.6vh] max-md:h-[6.4vh]"
                  >
                    <Icon name={item.icon} className="h-[44%] w-[44%]" />
                  </span>
                  <span className="font-vey-mono text-14 text-vey-slate">0{i + 1}</span>
                </div>
                <div className="relative flex h-[12vh] w-full items-center justify-center max-lg:h-[10vh] max-md:h-[16vh]">
                  <FeatureArt kind={i} />
                </div>
                <div className="relative flex flex-col gap-3">
                  <h3 className="text-40">{item.title}</h3>
                  <p className="text-24 text-vey-slate">{item.text}</p>
                  <span className="flex items-center gap-2 text-22 font-medium text-[#151927] opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100 max-md:opacity-100">
                    Learn more
                    <Arrow className="h-[0.9vw] w-[0.9vw] transition-transform duration-500 group-hover:translate-x-1 max-lg:h-[1.8vw] max-lg:w-[1.8vw] max-md:h-[3.7vw] max-md:w-[3.7vw]" />
                  </span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Features;
