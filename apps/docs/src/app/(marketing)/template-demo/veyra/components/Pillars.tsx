// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef } from "react";
import Scene from "./Scene";
import Lines from "./Animations/Lines";
import { fadeIn, useScene } from "./Animations/scene";
import { Icon } from "./Icons";
import { pillars } from "../content";

const Pillars = () => {
  const ref = useRef<HTMLElement>(null);

  useScene(ref, (tl, { q, mobile }) => {
    const rows = q("[data-row]");
    const previews = q("[data-preview]");
    tl.fromTo(rows, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.12, ease: "power2.out" }, 0.4);
    fadeIn(tl, q("[data-preview-frame]"), 0.8, 30, 1);
    rows.forEach((row, i) => {
      const at = 1.6 + i * 2;
      const bg = row.querySelector("[data-row-bg]");
      const icon = row.querySelector("[data-row-icon]");
      tl.fromTo(bg, { scaleX: 0, autoAlpha: 0 }, { scaleX: 1, autoAlpha: 1, duration: 0.8, ease: "power2.inOut" }, at);
      tl.fromTo(
        icon,
        { backgroundColor: "rgba(255,255,255,0.04)", color: "#aeb8e8" },
        { backgroundColor: "#aeb8e8", color: "#0b1020", duration: 0.5 },
        at,
      );
      tl.fromTo(row.querySelector("[data-row-text]"), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.6 }, at + 0.2);
      tl.fromTo(row.querySelector("[data-row-index]"), { color: "rgba(245,246,250,0.62)" }, { color: "#aeb8e8", duration: 0.4 }, at);
      if (!mobile && previews[i]) {
        tl.fromTo(previews[i], { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power2.out" }, at + 0.1);
        tl.fromTo(
          previews[i].querySelectorAll("[data-preview-row]"),
          { autoAlpha: 0, x: -10 },
          { autoAlpha: 1, x: 0, duration: 0.5, stagger: 0.18 },
          at + 0.35,
        );
      }
      const conn = row.querySelector("[data-conn]");
      if (conn) tl.fromTo(conn, { scaleY: 0 }, { scaleY: 1, duration: 0.9, ease: "power1.inOut" }, at + 1);
      if (i < rows.length - 1) {
        tl.to(bg, { autoAlpha: 0, duration: 0.6 }, at + 2);
        tl.to(icon, { backgroundColor: "rgba(174,184,232,0.14)", color: "#aeb8e8", duration: 0.5 }, at + 2);
        if (!mobile && previews[i]) tl.to(previews[i], { autoAlpha: 0, y: -16, duration: 0.6 }, at + 2);
      }
    });
    tl.to({}, { duration: 1 });
  });

  return (
    <Scene sectionRef={ref} id="pillars" chapter={5} innerClassName="justify-center">
      <div className="flex items-center justify-between gap-10 vey-container max-lg:flex-col max-lg:items-start max-md:py-[16vw]">
        <div className="flex w-[28%] flex-col gap-6 max-lg:w-[80%] max-md:w-full">
          <Lines id="pillars-title" lines={pillars.heading} />
          <p data-desc className="text-28 text-vey-dim">
            {pillars.description}
          </p>
        </div>

        <ol className="flex w-[40%] flex-col max-lg:w-full">
          {pillars.items.map((item, i) => (
            <li
              key={item.title}
              data-row
              className="relative flex gap-5 px-[1.2vw] py-[1.2vw] max-lg:px-[2.4vw] max-lg:py-[2.4vw] max-md:px-[4vw] max-md:py-[4vw]"
            >
              <span data-row-bg aria-hidden className="vey-glass absolute inset-0 origin-left rounded-md opacity-0" />
              <div className="relative flex flex-col items-center">
                <span
                  data-row-icon
                  className="flex h-[6vh] aspect-square items-center justify-center rounded-md border border-white/10 bg-white/5 text-[#aeb8e8] max-lg:h-[4.4vh] max-md:h-[6vh]"
                >
                  <Icon name={item.icon} className="h-[48%] w-[48%]" />
                </span>
                {i < pillars.items.length - 1 ? (
                  <span
                    aria-hidden
                    className="absolute top-[6vh] bottom-[-2.4vw] w-px bg-white/10 max-lg:top-[4.4vh] max-lg:bottom-[-4.8vw] max-md:top-[6vh] max-md:bottom-[-8vw]"
                  >
                    <span data-conn className="block h-full w-px origin-top bg-linear-to-b from-[#aeb8e8] to-[#aeb8e8]/0" />
                  </span>
                ) : null}
              </div>
              <div className="relative flex flex-1 flex-col gap-1">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="text-30">{item.title}</h3>
                  <span data-row-index className="font-vey-mono text-14 text-vey-dim">
                    {item.index}
                  </span>
                </div>
                <p data-row-text className="text-24 text-vey-dim">
                  {item.text}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div data-preview-frame aria-hidden className="relative h-[34vh] w-[22%] max-lg:hidden">
          {pillars.items.map((item) => (
            <div
              key={item.title}
              data-preview
              className="vey-glass absolute inset-0 flex flex-col gap-4 rounded-md px-[1.2vw] py-[1.2vw] opacity-0"
            >
              <div className="flex items-center justify-between">
                <span className="text-14 text-vey-dim">{item.preview.label}</span>
                <span className="flex items-center gap-2 text-14 text-vey-lilac">
                  <span className="block h-[0.8vh] aspect-square rounded-full bg-[#aeb8e8]" />
                  Live
                </span>
              </div>
              <div className="h-px w-full bg-white/10" />
              <ul className="flex flex-col gap-3">
                {item.preview.rows.map((row, r) => (
                  <li
                    key={row}
                    data-preview-row
                    className="flex items-center gap-3 rounded-md border border-white/5 bg-white/[0.03] px-[0.7vw] py-[0.6vw]"
                  >
                    <span
                      className={`block h-[1.2vh] aspect-square rounded-full border ${r === 0 ? "border-[#aeb8e8] bg-[#aeb8e8]" : "border-white/30"}`}
                    />
                    <span className="text-22">{row}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </Scene>
  );
};

export default Pillars;
