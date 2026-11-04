// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef } from "react";
import Scene from "./Scene";
import Lines from "./Animations/Lines";
import { draw, fadeIn, useScene } from "./Animations/scene";
import { curve, vcurve, type Point } from "./Animations/paths";
import { useReducedMotion } from "./Animations/reducedMotion";
import { AppGlyph, Mark } from "./Icons";
import { integrations } from "../content";

type Layout = {
  key: string;
  W: number;
  H: number;
  center: Point;
  tile: number;
  core: number;
  points: Point[];
  vertical: boolean;
  className: string;
  aspect: string;
};

const LAYOUTS: Layout[] = [
  {
    key: "wide",
    W: 1400,
    H: 640,
    center: [700, 320],
    tile: 0.075,
    core: 0.11,
    points: [
      [120, 110],
      [120, 320],
      [120, 530],
      [1280, 110],
      [1280, 320],
      [1280, 530],
    ],
    vertical: false,
    className: "max-md:hidden",
    aspect: "aspect-[1400/640]",
  },
  {
    key: "tall",
    W: 700,
    H: 900,
    center: [350, 450],
    tile: 0.16,
    core: 0.24,
    points: [
      [110, 100],
      [350, 100],
      [590, 100],
      [110, 800],
      [350, 800],
      [590, 800],
    ],
    vertical: true,
    className: "hidden max-md:block",
    aspect: "aspect-[700/900]",
  },
];

function strands(l: Layout, p: Point, i: number) {
  const half = (l.tile * l.W) / 2;
  const coreHalf = (l.core * l.W) / 2;
  const [cx, cy] = l.center;
  const spread = (k: number) => (k - 1) * (l.vertical ? 10 : 8);
  return [0, 1, 2].map((k) => {
    if (l.vertical) {
      const down = p[1] < cy;
      const from: Point = [cx + spread(k) + ((i % 3) - 1) * 22, cy + (down ? -coreHalf : coreHalf)];
      const to: Point = [p[0], p[1] + (down ? half : -half)];
      return vcurve(from, to, 0.5);
    }
    const left = p[0] < cx;
    const from: Point = [cx + (left ? -coreHalf : coreHalf), cy + spread(k) + ((i % 3) - 1) * 18];
    const to: Point = [p[0] + (left ? half : -half), p[1]];
    return curve(from, to, 0.5);
  });
}

function Stage({ l, reduce }: { l: Layout; reduce: boolean }) {
  return (
    <div aria-hidden className={`relative w-full ${l.aspect} ${l.className}`}>
      <svg viewBox={`0 0 ${l.W} ${l.H}`} className="absolute inset-0 h-full w-full overflow-visible">
        {l.points.map((p, i) => {
          const ds = strands(l, p, i);
          return (
            <g key={`${l.key}-${i}`} data-int-group={i}>
              {ds.map((d, k) => (
                <path
                  strokeLinecap="round"
                  key={d}
                  id={k === 1 ? `vey-int-${l.key}-${i}` : undefined}
                  data-int-path={i}
                  d={d}
                  fill="none"
                  stroke={k === 1 ? "#aeb8e8" : "#ffffff"}
                  strokeOpacity={k === 1 ? 0.75 : 0.14}
                  strokeWidth={k === 1 ? 1.5 : 1}
                />
              ))}
              {reduce ? null : (
                <circle data-int-dot={i} r="3.5" fill="#f5f6fa" opacity="0">
                  <animateMotion dur={`${2.2 + (i % 3) * 0.5}s`} repeatCount="indefinite" keyPoints="1;0" keyTimes="0;1" calcMode="linear">
                    <mpath href={`#vey-int-${l.key}-${i}`} />
                  </animateMotion>
                </circle>
              )}
            </g>
          );
        })}
      </svg>

      <div
        className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-3"
        style={{ left: `${(l.center[0] / l.W) * 100}%`, top: `${(l.center[1] / l.H) * 100}%`, width: `${l.core * 100}%` }}
      >
        <div
          data-int-core
          className="relative flex w-full aspect-square items-center justify-center rounded-md border border-white/20 bg-linear-to-br from-[#202b4a] to-[#0b1020]"
        >
          <span className="vey-glow absolute inset-[-60%] rounded-md" />
          <Mark className="relative w-[34%] text-[#f5f6fa]" />
        </div>
      </div>

      {integrations.apps.map((app, i) => {
        const p = l.points[i];
        return (
          <div
            key={`${l.key}-${app.name}`}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2"
            style={{ left: `${(p[0] / l.W) * 100}%`, top: `${(p[1] / l.H) * 100}%`, width: `${l.tile * 100}%` }}
          >
            <div
              data-int-app={i}
              className="flex w-full aspect-square items-center justify-center rounded-md border border-white/10 bg-white/[0.03] text-[#73798a]"
            >
              <AppGlyph app={app.app} className="w-[44%]" />
            </div>
            <span data-int-name={i} className="absolute top-full whitespace-nowrap py-[0.4vw] text-14 text-vey-dim max-md:py-[1vw]">
              {app.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}

const Integrations = () => {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  useScene(ref, (tl, { q }) => {
    tl.fromTo(q("[data-int-core]"), { scale: 0.6, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 1.2, ease: "back.out(1.4)" }, 0.8);
    tl.fromTo(q("[data-int-app]"), { autoAlpha: 0.25, scale: 0.92 }, { autoAlpha: 0.6, scale: 1, duration: 1, stagger: 0.08 }, 0.6);
    integrations.apps.forEach((_, i) => {
      const at = 2 + i * 0.85;
      draw(tl, q(`[data-int-path="${i}"]`), at, 1.2);
      tl.to(
        q(`[data-int-app="${i}"]`),
        { autoAlpha: 1, borderColor: "rgba(174,184,232,0.6)", color: "#e8eaf5", backgroundColor: "rgba(174,184,232,0.08)", duration: 0.5 },
        at + 1,
      );
      tl.fromTo(q(`[data-int-name="${i}"]`), { color: "rgba(245,246,250,0.4)" }, { color: "#f5f6fa", duration: 0.4 }, at + 1);
      tl.fromTo(q(`[data-int-dot="${i}"]`), { opacity: 0 }, { opacity: 1, duration: 0.4 }, at + 1.2);
    });
    fadeIn(tl, q("[data-int-more]"), 7.4, 12, 0.8);
    tl.to({}, { duration: 1 });
  });

  return (
    <Scene sectionRef={ref} id="integrations" chapter={7} innerClassName="justify-center">
      <div className="flex flex-col gap-10 vey-container max-md:gap-10 max-md:py-[16vw]">
        <div className="flex items-end justify-between gap-10 max-lg:flex-col max-lg:items-start">
          <Lines id="integrations-title" lines={integrations.heading} className="w-[50%] max-lg:w-[85%] max-md:w-full" />
          <p data-desc className="w-[28%] text-28 text-vey-dim max-lg:w-[70%] max-md:w-full">
            {integrations.description}
          </p>
        </div>
        <div className="relative w-[80%] self-center max-lg:w-full">
          {LAYOUTS.map((l) => (
            <Stage key={l.key} l={l} reduce={reduce} />
          ))}
          <div className="absolute bottom-[-1vh] left-1/2 -translate-x-1/2 max-md:static max-md:flex max-md:translate-x-0 max-md:justify-center max-md:py-[2vw]">
            <span
              data-int-more
              className="block whitespace-nowrap rounded-md border border-white/10 px-[1vw] py-[0.4vw] text-14 text-vey-dim max-lg:px-[2vw] max-lg:py-[0.8vw] max-md:px-[4vw] max-md:py-[1.6vw]"
            >
              + {integrations.more}
            </span>
          </div>
        </div>
      </div>
      <ul className="sr-only">
        {integrations.apps.map((app) => (
          <li key={app.name}>{app.name}</li>
        ))}
      </ul>
    </Scene>
  );
};

export default Integrations;
