// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef } from "react";
import Scene from "./Scene";
import Lines from "./Animations/Lines";
import { fadeIn, useScene } from "./Animations/scene";
import { useReducedMotion } from "./Animations/reducedMotion";
import { Mark } from "./Icons";
import { engine } from "../content";

const S = 800;
const C = S / 2;
const RINGS = [190, 290, 390, 490, 600, 720];

function roundedSquare(size: number) {
  const h = size / 2;
  const r = size * 0.24;
  const x0 = C - h;
  const y0 = C - h;
  const x1 = C + h;
  const y1 = C + h;
  return `M${x0 + r},${y0} H${x1 - r} Q${x1},${y0} ${x1},${y0 + r} V${y1 - r} Q${x1},${y1} ${x1 - r},${y1} H${x0 + r} Q${x0},${y1} ${x0},${y1 - r} V${y0 + r} Q${x0},${y0} ${x0 + r},${y0} Z`;
}

const SIGNAL_POS = [
  "left-1/2 top-0 -translate-x-1/2",
  "right-0 top-1/2 -translate-y-1/2",
  "bottom-0 left-1/2 -translate-x-1/2",
  "left-0 top-1/2 -translate-y-1/2",
];

const ORBITS = [
  { ring: 1, dur: "9s" },
  { ring: 2, dur: "13s" },
  { ring: 3, dur: "17s" },
  { ring: 4, dur: "23s" },
];

const Engine = () => {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  useScene(ref, (tl, { q }) => {
    const rings = q("[data-ring]");
    tl.fromTo(
      rings,
      { scale: 0.55, autoAlpha: 0, transformOrigin: "50% 50%" },
      { scale: 1, autoAlpha: 1, duration: 2.2, stagger: 0.18, ease: "power2.out" },
      0.3,
    );
    tl.fromTo(q("[data-core]"), { scale: 0.7, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 1.4, ease: "power2.out" }, 0.8);
    tl.fromTo(q("[data-engine-glow]"), { scale: 0.6, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 2 }, 0.8);
    rings.forEach((ring, i) => {
      tl.to(ring, { scale: 0.92 + (i % 2) * 0.03, rotate: i % 2 ? 4 : -3, duration: 2.4, ease: "sine.inOut" }, 3.4 + i * 0.06);
      tl.to(ring, { scale: 1, rotate: 0, duration: 2.4, ease: "sine.inOut" }, 6 + i * 0.06);
    });
    q("[data-signal]").forEach((el, i) => {
      tl.fromTo(el, { autoAlpha: 0.2 }, { autoAlpha: 1, duration: 0.5 }, 3.6 + i * 1.1);
      tl.fromTo(
        el.querySelector("[data-signal-dot]"),
        { backgroundColor: "rgba(174,184,232,0)" },
        { backgroundColor: "#aeb8e8", duration: 0.3 },
        3.6 + i * 1.1,
      );
      fadeIn(tl, q("[data-signal-row]")[i], 3.6 + i * 1.1, 12, 0.6);
    });
    tl.to(q("[data-core-ring]"), { autoAlpha: 1, scale: 1.12, duration: 1 }, 8);
    tl.to({}, { duration: 1 });
  });

  return (
    <Scene sectionRef={ref} id="engine" chapter={4} innerClassName="justify-center">
      <div className="flex items-center justify-between gap-10 vey-container max-lg:flex-col max-lg:items-start max-md:py-[16vw]">
        <div className="flex w-[34%] flex-col gap-8 max-lg:w-[80%] max-md:w-full">
          <Lines id="engine-title" lines={engine.heading} />
          <p data-desc className="text-28 text-vey-dim">
            {engine.description}
          </p>
          <ul className="flex flex-col">
            {engine.signals.map((s, i) => (
              <li
                key={s}
                data-signal-row
                className="flex items-center justify-between border-t border-white/10 py-[0.9vw] max-lg:py-[1.8vw] max-md:py-[3vw]"
              >
                <span className="text-24">{s}</span>
                <span className="font-vey-mono text-14 text-vey-dim">0{i + 1}</span>
              </li>
            ))}
          </ul>
        </div>

        <div aria-hidden className="relative h-[78vh] aspect-square max-lg:h-auto max-lg:w-[80%] max-lg:self-center max-md:w-full">
          <div data-engine-glow className="vey-glow absolute inset-[10%] rounded-md" />
          <svg viewBox={`0 0 ${S} ${S}`} className="absolute inset-[6%] h-[88%] w-[88%] overflow-visible">
            <defs>
              <linearGradient id="vey-ring" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#e8eaf5" stopOpacity="0.5" />
                <stop offset="0.5" stopColor="#aeb8e8" stopOpacity="0.12" />
                <stop offset="1" stopColor="#aeb8e8" stopOpacity="0.4" />
              </linearGradient>
            </defs>
            {RINGS.map((size, i) => (
              <path
                key={size}
                id={`vey-ring-${i}`}
                data-ring
                d={roundedSquare(size)}
                fill={i === 0 ? "rgba(174,184,232,0.06)" : "none"}
                stroke="url(#vey-ring)"
                strokeOpacity={1 - i * 0.13}
                strokeWidth={i === 0 ? 1.6 : 1.1}
              />
            ))}
            {reduce
              ? null
              : ORBITS.map((o) => (
                  <circle key={o.ring} r="3" fill="#e8eaf5">
                    <animateMotion dur={o.dur} repeatCount="indefinite" rotate="auto">
                      <mpath href={`#vey-ring-${o.ring}`} />
                    </animateMotion>
                  </circle>
                ))}
          </svg>

          <div className="absolute inset-0 flex items-center justify-center">
            <div
              data-core
              className="relative flex w-[22%] aspect-square flex-col items-center justify-center gap-3 rounded-md border border-white/15 bg-linear-to-br from-[#202b4a] to-[#0b1020]"
            >
              <span data-core-ring className="absolute inset-[-8%] rounded-md border border-[#aeb8e8]/40 opacity-0" />
              <Mark className="w-[34%] text-[#e8eaf5]" />
              <span className="text-14 text-vey-dim">{engine.core}</span>
            </div>
          </div>

          {engine.signals.map((s, i) => (
            <div key={s} className={`absolute ${SIGNAL_POS[i]}`}>
              <span
                data-signal
                className="flex items-center gap-2 rounded-md border border-white/10 bg-[#0b1020] px-[0.8vw] py-[0.4vw] text-14 max-lg:px-[1.6vw] max-lg:py-[0.8vw] max-md:px-[3vw] max-md:py-[1.4vw]"
              >
                <span data-signal-dot className="block h-[0.8vh] aspect-square rounded-full border border-[#aeb8e8]" />
                {s}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Scene>
  );
};

export default Engine;
