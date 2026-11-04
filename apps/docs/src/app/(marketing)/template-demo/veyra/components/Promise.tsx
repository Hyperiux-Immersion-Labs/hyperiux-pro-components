// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef } from "react";
import Scene from "./Scene";
import Lines from "./Animations/Lines";
import { fadeIn, useScene } from "./Animations/scene";
import { wave } from "./Animations/paths";
import { promise } from "../content";

const W = 1440;
const H = 500;
const LINES = 9;
const NODE_T = [0.14, 0.4, 0.64, 0.88];

const chaos = Array.from({ length: LINES }, (_, i) => ({
  amp: 40 + ((i * 37) % 110),
  freq: 0.6 + ((i * 0.29) % 1.1),
  phase: (i * 1.7) % (Math.PI * 2),
  y: H / 2 + (((i * 53) % 220) - 110),
}));

const ORDER = { amp: 70, freq: 1.05, phase: 0.6 };

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function lineParams(i: number, p: number) {
  const c = chaos[i];
  const e = p * p * (3 - 2 * p);
  return {
    amp: lerp(c.amp, ORDER.amp - Math.abs(i - 4) * 3, e),
    freq: lerp(c.freq, ORDER.freq, e),
    phase: lerp(c.phase, ORDER.phase + (i - 4) * 0.06, e),
    y: lerp(c.y, H / 2 + (i - 4) * 9, e),
  };
}

function nodePoint(t: number) {
  const o = lineParams(4, 1);
  return { x: t * W, y: o.y + Math.sin(t * Math.PI * 2 * o.freq + o.phase) * o.amp };
}

const PromiseSection = () => {
  const ref = useRef<HTMLElement>(null);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);

  const render = (p: number) => {
    pathRefs.current.forEach((path, i) => {
      if (!path) return;
      const l = lineParams(i, p);
      path.setAttribute("d", wave(W, l.y, l.amp, l.freq, l.phase, 32));
    });
  };

  useScene(ref, (tl, { q, mobile }) => {
    const state = { p: 0 };
    render(0);
    tl.fromTo(q("[data-wave-clip]"), { attr: { width: 0 } }, { attr: { width: W + 200 }, duration: 2.6, ease: "power1.inOut" }, 0.2);
    tl.to(state, { p: 1, duration: 3, ease: "power1.inOut", onUpdate: () => render(state.p) }, 2.2);
    q("[data-node]").forEach((node, i) => {
      const at = 5.2 + i * 1;
      tl.fromTo(
        node.querySelector("[data-node-dot]"),
        { scale: 0.4, autoAlpha: 0.3 },
        { scale: 1, autoAlpha: 1, duration: 0.5, ease: "back.out(2)" },
        at,
      );
      tl.fromTo(node.querySelector("[data-node-ring]"), { scale: 0.2, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.6 }, at + 0.1);
      tl.fromTo(node.querySelector("[data-node-label]"), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.5 }, at + 0.15);
    });
    q("[data-statement]").forEach((el, i) => fadeIn(tl, el, 5.3 + i * 1.1, 20, 0.8));
    tl.to({}, { duration: 1 });
  });

  return (
    <Scene sectionRef={ref} id="promise" chapter={1} innerClassName="justify-between gap-10 py-[14vh] max-md:py-[16vw]">
      <div className="flex items-start justify-between gap-10 vey-container max-md:flex-col">
        <Lines id="promise-title" lines={promise.heading} className="w-[50%] max-lg:w-[70%] max-md:w-full" />
        <ol className="flex w-[24%] flex-col gap-5 max-lg:w-[30%] max-md:w-full">
          {promise.statements.map((s, i) => (
            <li key={s} data-statement className="flex gap-4 border-t border-white/10 py-[1vw] max-lg:py-[2vw] max-md:py-[3vw]">
              <span className="font-vey-mono text-14 text-vey-lilac">0{i + 1}</span>
              <span className="text-24 text-vey-dim">{s}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="w-full max-md:overflow-hidden max-md:py-[6vw]">
        <div className="relative w-full aspect-[1440/500] max-md:w-[180%] max-md:translate-x-[-22%]">
          <svg viewBox={`0 0 ${W} ${H}`} aria-hidden className="absolute inset-0 h-full w-full overflow-visible">
            <defs>
              <linearGradient id="vey-promise-stroke" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0" stopColor="#aeb8e8" stopOpacity="0" />
                <stop offset="0.25" stopColor="#aeb8e8" stopOpacity="0.55" />
                <stop offset="0.75" stopColor="#e8eaf5" stopOpacity="0.8" />
                <stop offset="1" stopColor="#aeb8e8" stopOpacity="0" />
              </linearGradient>
              <clipPath id="vey-promise-clip">
                <rect data-wave-clip x="-100" y="-300" width={W + 200} height={H + 600} />
              </clipPath>
            </defs>
            <g clipPath="url(#vey-promise-clip)">
              {chaos.map((_, i) => (
                <path
                  strokeLinecap="round"
                  key={i}
                  ref={(el) => {
                    pathRefs.current[i] = el;
                  }}
                  data-wave
                  d={wave(W, lineParams(i, 1).y, lineParams(i, 1).amp, lineParams(i, 1).freq, lineParams(i, 1).phase, 32)}
                  fill="none"
                  stroke="url(#vey-promise-stroke)"
                  strokeWidth={i === 4 ? 1.8 : 1}
                  strokeOpacity={i === 4 ? 1 : 0.45}
                />
              ))}
            </g>
          </svg>
          {promise.nodes.map((label, i) => {
            const pt = nodePoint(NODE_T[i]);
            return (
              <div
                key={label}
                data-node
                className="absolute flex h-0 w-0 items-center justify-center"
                style={{ left: `${(pt.x / W) * 100}%`, top: `${(pt.y / H) * 100}%` }}
              >
                <span data-node-ring className="absolute block h-[4.4vh] aspect-square rounded-md border border-[#aeb8e8]/40" />
                <span data-node-dot className="absolute block h-[1.2vh] aspect-square rounded-full bg-[#e8eaf5]" />
                <span data-node-label className="absolute top-[3.4vh] whitespace-nowrap text-14 text-[#e8eaf5]">
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Scene>
  );
};

export default PromiseSection;
