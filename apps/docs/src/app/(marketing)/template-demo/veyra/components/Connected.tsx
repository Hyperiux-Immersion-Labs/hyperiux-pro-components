// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef } from "react";
import Scene from "./Scene";
import Lines from "./Animations/Lines";
import { draw, fadeIn, useScene } from "./Animations/scene";
import { curve } from "./Animations/paths";
import { Icon, Mark } from "./Icons";
import { connected } from "../content";

const W = 1600;
const H = 1000;
const CARD_HALF = 0.12;
const CORE_HALF = 0.15;

const connectors = connected.sources.map((s) => {
  const left = s.x < 50;
  const from: [number, number] = [(s.x / 100 + (left ? CARD_HALF : -CARD_HALF)) * W, (s.y / 100) * H];
  const to: [number, number] = [(0.5 + (left ? -CORE_HALF : CORE_HALF)) * W, H / 2 + (s.y - 50) * 0.6];
  return curve(from, to, 0.55);
});

const Connected = () => {
  const ref = useRef<HTMLElement>(null);

  useScene(ref, (tl, { q, mobile }) => {
    const cards = q("[data-source]");
    const stage = q("[data-stage]")[0] as HTMLElement | undefined;
    if (mobile || !stage) {
      tl.fromTo(cards, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, stagger: 0.25, duration: 1, ease: "power2.out" }, 0.8);
      tl.fromTo(q("[data-core]"), { autoAlpha: 0, scale: 0.94 }, { autoAlpha: 1, scale: 1, duration: 1 }, 0.4);
      return;
    }
    cards.forEach((card, i) => {
      const s = connected.sources[i];
      tl.fromTo(
        card,
        {
          x: () => (stage.offsetWidth * s.dx) / 100,
          y: () => (stage.offsetHeight * s.dy) / 100,
          rotate: s.rot,
          autoAlpha: 0.25,
          scale: 0.9,
        },
        { x: 0, y: 0, rotate: 0, autoAlpha: 1, scale: 1, duration: 2.6, ease: "power2.inOut" },
        0.6 + (i % 3) * 0.25 + (i > 2 ? 0.15 : 0),
      );
    });
    tl.fromTo(q("[data-core]"), { autoAlpha: 0, scale: 0.86 }, { autoAlpha: 1, scale: 1, duration: 1.4, ease: "power2.out" }, 2.6);
    draw(tl, q("[data-connector]"), 3.4, 1.6);
    tl.fromTo(q("[data-pulse]"), { strokeDashoffset: 0.08 }, { strokeDashoffset: -1, duration: 2.4, stagger: 0.12 }, 5);
    tl.to(q("[data-core-ring]"), { autoAlpha: 1, scale: 1.06, duration: 1 }, 6.4);
    fadeIn(tl, q("[data-core-status]"), 6.6, 8, 0.8);
    tl.to({}, { duration: 1 });
  });

  return (
    <Scene sectionRef={ref} id="connected" chapter={2} innerClassName="justify-center">
      <div className="flex items-center justify-between gap-10 vey-container max-lg:flex-col max-lg:items-start max-md:py-[16vw]">
        <div className="flex w-[34%] flex-col gap-6 max-lg:w-[80%] max-md:w-full">
          <Lines id="connected-title" lines={connected.heading} />
          <p data-desc className="text-28 text-vey-dim">
            {connected.description}
          </p>
        </div>

        <div
          data-stage
          className="relative w-[58%] aspect-[1600/1000] max-lg:w-full max-md:grid max-md:aspect-auto max-md:grid-cols-2 max-md:gap-3"
        >
          <svg viewBox={`0 0 ${W} ${H}`} aria-hidden className="absolute inset-0 h-full w-full max-md:hidden">
            {connectors.map((d) => (
              <g key={d}>
                <path d={d} fill="none" stroke="#ffffff" strokeOpacity="0.06" strokeWidth="1.5" />
                <path strokeLinecap="round" data-connector d={d} fill="none" stroke="#aeb8e8" strokeOpacity="0.7" strokeWidth="1.5" />
                <path
                  data-pulse
                  d={d}
                  pathLength={1}
                  strokeDasharray="0.08 1"
                  strokeDashoffset="0.08"
                  fill="none"
                  stroke="#f5f6fa"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </g>
            ))}
          </svg>

          <div className="absolute left-1/2 top-1/2 w-[30%] -translate-x-1/2 -translate-y-1/2 max-md:static max-md:order-first max-md:col-span-2 max-md:w-full max-md:translate-x-0 max-md:translate-y-0">
            <div data-core className="flex w-full flex-col items-center gap-3">
              <div className="vey-glass relative flex w-full items-center justify-center gap-3 rounded-md px-[1.4vw] py-[1.6vw] max-lg:px-[2.4vw] max-lg:py-[2.6vw] max-md:px-[5vw] max-md:py-[5vw]">
                <span data-core-ring className="pointer-events-none absolute inset-0 rounded-md border border-[#aeb8e8]/60 opacity-0" />
                <Mark className="h-[1.3vw] w-[1.3vw] text-[#e8eaf5] max-lg:h-[2.6vw] max-lg:w-[2.6vw] max-md:h-[5vw] max-md:w-[5vw]" />
                <span className="text-24 font-medium">{connected.core}</span>
              </div>
              <span data-core-status className="flex items-center gap-2 text-14 text-vey-dim">
                <span className="block h-[0.8vh] aspect-square rounded-full bg-[#aeb8e8]" />
                {connected.sources.length} sources connected
              </span>
            </div>
          </div>

          {connected.sources.map((s) => (
            <div
              key={s.title}
              className="absolute w-[24%] -translate-x-1/2 -translate-y-1/2 max-md:static max-md:w-full max-md:translate-x-0 max-md:translate-y-0"
              style={{ left: `${s.x}%`, top: `${s.y}%` }}
            >
              <div
                data-source
                className="vey-glass flex items-center gap-3 rounded-md px-[0.9vw] py-[0.9vw] max-lg:px-[1.6vw] max-lg:py-[1.6vw] max-md:px-[3vw] max-md:py-[3vw]"
              >
                <span className="flex h-[4.4vh] aspect-square shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/5 text-[#aeb8e8] max-lg:h-[3.4vh] max-md:h-[4.4vh]">
                  <Icon name={s.icon} className="h-[55%] w-[55%]" />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-22 font-medium">{s.title}</span>
                  <span className="truncate text-14 text-vey-dim">{s.meta}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Scene>
  );
};

export default Connected;
