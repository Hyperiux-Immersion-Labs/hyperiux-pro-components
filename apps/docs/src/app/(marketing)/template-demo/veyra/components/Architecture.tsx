// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef } from "react";
import Scene from "./Scene";
import Lines from "./Animations/Lines";
import { fadeIn, useScene } from "./Animations/scene";
import { Icon } from "./Icons";
import { architecture } from "../content";

const SPREAD = 0.21;
const COMPACT = 0.085;

const Architecture = () => {
  const ref = useRef<HTMLElement>(null);

  useScene(ref, (tl, { q, mobile }) => {
    const stage = q("[data-arch-stage]")[0] as HTMLElement | undefined;
    if (!stage) return;
    const layers = q("[data-layer]");
    const offset = (i: number, spread: number) => () => (i - 1.5) * spread * stage.offsetHeight;
    const spread = mobile ? SPREAD * 0.85 : SPREAD;

    tl.fromTo(q("[data-spine]"), { scaleY: 0 }, { scaleY: 1, duration: 3.6, ease: "power1.inOut" }, 1);
    layers.forEach((layer, i) => {
      const at = 0.8 + i * 1;
      tl.fromTo(
        layer,
        { y: () => offset(i, spread)() - stage.offsetHeight * 0.12, autoAlpha: 0 },
        { y: offset(i, spread), autoAlpha: 1, duration: 1.2, ease: "power2.out" },
        at,
      );
      const label = layer.querySelector("[data-layer-label]");
      if (label) tl.fromTo(label, { autoAlpha: 0, x: -16 }, { autoAlpha: 1, x: 0, duration: 0.8 }, at + 0.4);
      const leader = layer.querySelector("[data-leader]");
      if (leader) tl.fromTo(leader, { scaleX: 0 }, { scaleX: 1, duration: 0.6 }, at + 0.5);
      fadeIn(tl, q("[data-mlabel]")[i], at + 0.3, 12, 0.6);
    });

    const merge = 5.6;
    layers.forEach((layer, i) => {
      tl.to(layer, { y: offset(i, mobile ? COMPACT * 0.85 : COMPACT), duration: 2, ease: "power2.inOut" }, merge);
    });
    tl.to(q("[data-layer-text]"), { autoAlpha: 0, duration: 0.6 }, merge);
    tl.to(q("[data-spine]"), { scaleY: COMPACT / SPREAD, duration: 2, ease: "power2.inOut" }, merge);
    tl.to(q("[data-plate]"), { borderColor: "rgba(174,184,232,0.55)", duration: 1 }, merge + 1.2);
    tl.fromTo(q("[data-unified]"), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 1 }, merge + 1.6);
    tl.fromTo(q("[data-unified-glow]"), { autoAlpha: 0, scale: 0.7 }, { autoAlpha: 1, scale: 1, duration: 1.6 }, merge + 1);
    tl.to({}, { duration: 1 });
  });

  return (
    <Scene sectionRef={ref} id="architecture" chapter={6} innerClassName="justify-center">
      <div className="flex items-center justify-between gap-10 vey-container max-lg:flex-col max-lg:items-start max-md:py-[16vw]">
        <div className="flex w-[30%] flex-col gap-6 max-lg:w-[80%] max-md:w-full">
          <Lines id="architecture-title" lines={architecture.heading} />
          <p data-desc className="text-28 text-vey-dim">
            {architecture.description}
          </p>
          <ul className="hidden flex-col max-md:flex">
            {architecture.layers.map((layer) => (
              <li key={layer.title} data-mlabel className="flex items-center justify-between gap-4 border-t border-white/10 py-[3vw]">
                <span className="text-24 font-medium">{layer.title}</span>
                <span className="text-14 text-vey-dim">{layer.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div data-arch-stage aria-hidden className="relative h-[80vh] w-[56%] max-lg:h-[60vh] max-lg:w-full max-md:h-[90vw]">
          <div data-unified-glow className="vey-glow absolute inset-x-[10%] inset-y-[20%] rounded-md opacity-0" />
          <span className="absolute left-[62%] top-[18%] bottom-[18%] w-px bg-white/5 max-lg:left-1/2">
            <span data-spine className="block h-full w-px origin-center bg-linear-to-b from-[#aeb8e8]/0 via-[#aeb8e8] to-[#aeb8e8]/0" />
          </span>
          {architecture.layers.map((layer, i) => (
            <div key={layer.title} className={`absolute left-[62%] top-1/2 h-0 w-0 max-lg:left-1/2 ${["z-40", "z-30", "z-20", "z-10"][i]}`}>
              <div data-layer className="absolute h-0 w-0">
                <div className="absolute left-1/2 top-1/2 h-[16vw] w-[16vw] -translate-x-1/2 -translate-y-1/2 max-lg:h-[24vw] max-lg:w-[24vw] max-md:h-[36vw] max-md:w-[36vw]">
                  <div
                    data-plate
                    className="vey-plate h-full w-full rounded-md border border-white/15 bg-linear-to-br from-[#aeb8e8]/25 via-[#202b4a]/80 to-[#0b1020]/90"
                  />
                </div>
                <span className="absolute left-1/2 top-1/2 flex h-[4.4vh] aspect-square -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-md text-[#e8eaf5] max-md:h-[4vh]">
                  <Icon name={layer.icon} className="h-full w-full" strokeWidth={1.3} />
                </span>
                <span
                  data-leader
                  className="absolute right-[11.4vw] top-0 block h-px w-[3vw] origin-right bg-white/25 max-lg:right-[17vw] max-md:hidden"
                />
                <div className="absolute right-[14.8vw] top-0 w-[16vw] -translate-y-1/2 max-lg:right-[20.4vw] max-lg:w-[24vw] max-md:hidden">
                  <div data-layer-label className="flex flex-col items-end gap-1 text-right">
                    <span className="font-vey-mono text-14 text-vey-lilac">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-30 font-medium uppercase tracking-wide">{layer.title}</span>
                    <span data-layer-text className="text-22 text-vey-dim">
                      {layer.text}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div className="absolute bottom-0 left-[62%] -translate-x-1/2 max-lg:left-1/2">
            <div
              data-unified
              className="flex items-center gap-3 whitespace-nowrap rounded-md border border-white/10 px-[1.2vw] py-[0.6vw] text-14 text-vey-dim max-lg:px-[2.4vw] max-lg:py-[1.2vw] max-md:px-[4vw] max-md:py-[2vw]"
            >
              <span className="block h-[0.8vh] aspect-square rounded-full bg-[#aeb8e8]" />
              {architecture.unified}
            </div>
          </div>
        </div>
      </div>
    </Scene>
  );
};

export default Architecture;
