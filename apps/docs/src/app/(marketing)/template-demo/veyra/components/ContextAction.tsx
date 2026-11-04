// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef } from "react";
import Scene from "./Scene";
import Lines from "./Animations/Lines";
import { draw, fadeIn, useScene } from "./Animations/scene";
import { segments, smooth, type Point } from "./Animations/paths";
import { contextAction } from "../content";

const W = 1200;
const H = 600;
const POINTS: Point[] = [
  [0, 580],
  [230, 480],
  [610, 330],
  [960, 150],
  [1200, 100],
];
const NODES = POINTS.slice(1, 4);
const SEGMENTS = segments(POINTS);
const FULL = smooth(POINTS);

const ContextAction = () => {
  const ref = useRef<HTMLElement>(null);

  useScene(ref, (tl, { q, mobile }) => {
    if (mobile) {
      q("[data-mstage]").forEach((el, i) => {
        const bar = el.querySelector("[data-mbar]");
        if (bar) tl.fromTo(bar, { scaleY: 0 }, { scaleY: 1, duration: 1 }, 0.6 + i * 1.2);
        fadeIn(tl, el.querySelector("[data-mcopy]"), 0.8 + i * 1.2, 16, 0.8);
        tl.fromTo(
          el.querySelector("[data-mdot]"),
          { backgroundColor: "rgba(174,184,232,0)" },
          { backgroundColor: "#aeb8e8", duration: 0.3 },
          0.7 + i * 1.2,
        );
      });
      return;
    }
    const segs = q("[data-seg]");
    const nodes = q("[data-stage-node]");
    const copies = q("[data-stage-copy]");
    tl.fromTo(q("[data-route]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 1 }, 0.2);
    draw(tl, segs[0], 0.8, 1.4);
    nodes.forEach((node, i) => {
      const at = 2.2 + i * 2.1;
      tl.fromTo(
        node.querySelector("[data-dot]"),
        { scale: 0.5, backgroundColor: "#0b1020" },
        { scale: 1, backgroundColor: "#f5f6fa", duration: 0.4, ease: "back.out(2)" },
        at,
      );
      tl.fromTo(node.querySelector("[data-halo]"), { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.6 }, at);
      tl.fromTo(copies[i], { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power2.out" }, at + 0.15);
      if (i > 0) tl.to(nodes[i - 1].querySelector("[data-halo]"), { autoAlpha: 0.35, duration: 0.5 }, at);
      if (segs[i + 1]) draw(tl, segs[i + 1], at + 0.5, 1.5);
    });
    tl.fromTo(q("[data-end]"), { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.6 }, 8.6);
    tl.to({}, { duration: 1 });
  });

  return (
    <Scene sectionRef={ref} id="context" chapter={3} innerClassName="max-md:py-[16vw]">
      <div className="relative z-10 vey-container py-[14vh] max-md:py-0">
        <Lines id="context-title" lines={contextAction.heading} className="w-[45%] max-lg:w-[80%] max-md:w-full" />
      </div>

      <div className="absolute bottom-[8vh] right-[5vw] w-[78%] aspect-[1200/600] max-lg:w-[90%] max-md:hidden">
        <svg viewBox={`0 0 ${W} ${H}`} aria-hidden className="absolute inset-0 h-full w-full overflow-visible">
          <defs>
            <linearGradient id="vey-route" x1="0" x2="1" y1="1" y2="0">
              <stop offset="0" stopColor="#aeb8e8" stopOpacity="0" />
              <stop offset="0.3" stopColor="#aeb8e8" stopOpacity="0.8" />
              <stop offset="1" stopColor="#f5f6fa" />
            </linearGradient>
          </defs>
          <path
            data-route
            d={FULL}
            pathLength={1}
            strokeDasharray="0.004 0.01"
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.18"
            strokeWidth="1.2"
          />
          {SEGMENTS.map((d) => (
            <path strokeLinecap="round" key={d} data-seg d={d} fill="none" stroke="url(#vey-route)" strokeWidth="2" />
          ))}
        </svg>
        {NODES.map(([x, y], i) => (
          <div
            key={x}
            data-stage-node
            className="absolute flex h-0 w-0 items-center justify-center"
            style={{ left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%` }}
          >
            <span data-halo className="absolute block h-[5vh] aspect-square rounded-md border border-[#aeb8e8]/50 bg-[#aeb8e8]/10" />
            <span data-dot className="absolute block h-[1.4vh] aspect-square rounded-full border border-[#f5f6fa] bg-[#0b1020]" />
            <span className="absolute bottom-[2.4vh] whitespace-nowrap text-22 font-medium">{contextAction.stages[i].title}</span>
          </div>
        ))}
        {NODES.map(([x, y], i) => (
          <div
            key={`copy-${x}`}
            data-stage-copy
            className="absolute flex w-[24%] flex-col gap-2 max-lg:w-[28%]"
            style={{ left: `${(x / W) * 100 - (i === 2 ? 8 : -2)}%`, top: `${(y / H) * 100 + 8}%` }}
          >
            <span className="font-vey-mono text-14 text-vey-lilac">{contextAction.stages[i].index}</span>
            <p className="text-24 text-vey-dim">{contextAction.stages[i].text}</p>
          </div>
        ))}
        <div aria-hidden className="absolute left-full top-[16.7%] flex h-0 w-0 items-center justify-center">
          <span data-end className="absolute block h-[1vh] aspect-square rounded-full bg-[#f5f6fa]" />
        </div>
      </div>

      <ol className="hidden flex-col vey-container max-md:flex max-md:py-[8vw]">
        {contextAction.stages.map((stage, i) => (
          <li key={stage.title} data-mstage className="flex gap-5">
            <div className="relative flex flex-col items-center">
              <span data-mdot className="relative z-10 block h-[3.4vw] aspect-square rounded-md border border-[#aeb8e8]" />
              {i < contextAction.stages.length - 1 ? (
                <span className="block w-px flex-1 bg-white/10">
                  <span data-mbar className="block h-full w-px origin-top bg-[#aeb8e8]" />
                </span>
              ) : null}
            </div>
            <div data-mcopy className="flex flex-col gap-2 py-[4vw]">
              <span className="font-vey-mono text-14 text-vey-lilac">{stage.index}</span>
              <h3 className="text-30">{stage.title}</h3>
              <p className="text-24 text-vey-dim">{stage.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </Scene>
  );
};

export default ContextAction;
