// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useEffect, useRef, useState } from "react";
import Lines from "./Animations/Lines";
import { draw, lineIn, useReveal, useScene } from "./Animations/scene";
import AnimatedHoverCard from "./effects/animated-hover-card";
import TextStream from "./effects/text-stream";
import { platform, platformPreviews, platformStream } from "../content";

const Platform = () => {
  const ref = useRef<HTMLElement>(null);
  const [portal, setPortal] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortal(ref.current?.closest<HTMLElement>(".vey-page") ?? null);
  }, []);

  useReveal(ref, (tl, { q }) => {
    lineIn(tl, q("[data-line]"), 0, 1);
    tl.fromTo(q("[data-desc]"), { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0 }, 0.3);
    tl.fromTo(q("[data-cap-rule]"), { scaleX: 0 }, { scaleX: 1, duration: 1.2, stagger: 0.1, ease: "power2.inOut" }, 0.4);
    tl.fromTo(q("[data-cap]"), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, stagger: 0.1 }, 0.6);
    tl.fromTo(q("[data-stream]"), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 1 }, 0.45);
  });

  useScene(
    ref,
    (tl, { q }) => {
      draw(tl, q("[data-pf-thread]"), 0, 1);
      tl.fromTo(q("[data-pf-wash]"), { autoAlpha: 0, yPercent: 20 }, { autoAlpha: 1, yPercent: 0, duration: 1 }, 0.2);
    },
    { start: "top bottom", scrub: 1, revealText: false },
  );

  return (
    <section
      ref={ref}
      id="platform"
      aria-labelledby="platform-title"
      data-vey-tone="light"
      className="relative overflow-x-clip bg-vey-paper text-vey-ink"
    >
      <svg aria-hidden viewBox="0 0 1440 900" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="vey-pf-wash" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#aeb8e8" stopOpacity="0.28" />
            <stop offset="1" stopColor="#aeb8e8" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path data-pf-wash d="M0 820 C380 820 620 700 900 690 C1150 680 1300 600 1440 520 L1440 900 L0 900 Z" fill="url(#vey-pf-wash)" />
        <path
          strokeLinecap="round"
          data-pf-thread
          d="M1200 0 C1210 180 1150 300 980 380 C760 480 420 520 0 760"
          fill="none"
          stroke="#aeb8e8"
          strokeWidth="1.2"
        />
      </svg>

      <div className="relative flex flex-col gap-24 vey-container vey-section max-lg:gap-16 max-md:gap-14">
        <div className="flex items-end justify-between gap-10 max-lg:flex-col max-lg:items-start">
          <Lines id="platform-title" lines={platform.heading} className="w-[58%] max-lg:w-[90%] max-md:w-full" />
          <p data-desc className="w-[26%] text-28 text-vey-slate max-lg:w-[60%] max-md:w-full">
            {platform.description}
          </p>
        </div>

        <div data-stream className="flex items-center gap-6 max-md:flex-col max-md:items-start max-md:gap-2">
          <span className="text-40 font-medium">{platformStream.prefix}</span>
          <TextStream
            items={platformStream.items}
            className="h-[10.2vw] flex-1 max-lg:h-[16.2vw] max-md:h-[27vw] max-md:w-full max-md:flex-none"
            itemClassName="flex h-[3.4vw] items-center text-40 text-vey-slate max-lg:h-[5.4vw] max-md:h-[9vw]"
          />
        </div>

        <ul className="grid grid-cols-4 gap-8 max-lg:grid-cols-2 max-md:grid-cols-1 max-md:gap-6">
          {platform.capabilities.map((c) => {
            const preview = platformPreviews[c.title];
            return (
              <li key={c.title} className="flex flex-col gap-4">
                <span data-cap-rule className="block h-px w-full origin-left bg-[#151927]/15" />
                <div data-cap className="flex flex-col gap-2">
                  <span className="font-vey-mono text-14 text-vey-slate">{c.index}</span>
                  {preview ? (
                    <AnimatedHoverCard.Root>
                      <AnimatedHoverCard.Trigger href="#dashboard" className="w-fit">
                        <h3 className="text-30">{c.title}</h3>
                      </AnimatedHoverCard.Trigger>
                      <AnimatedHoverCard.Content container={portal} side="top" className="w-[18vw] max-lg:w-[34vw] max-md:w-[70vw]">
                        <div className="flex flex-col gap-3 rounded-md bg-[#151927] px-[1vw] py-[1vw] text-[#f5f6fa] shadow-[0_24px_48px_-24px_rgba(21,25,39,0.55)] max-lg:px-[2vw] max-lg:py-[2vw] max-md:px-[4vw] max-md:py-[4vw]">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-22 font-medium">{preview.title}</span>
                            <span className="flex items-center gap-2 text-14 text-vey-lilac">
                              <span className="block h-[0.8vh] aspect-square rounded-full bg-[#aeb8e8]" />
                              {preview.status}
                            </span>
                          </div>
                          <span className="block h-px w-full bg-white/10" />
                          <ul className="flex flex-col gap-2">
                            {preview.rows.map((row, r) => (
                              <li key={row} className="flex items-center gap-3 text-14 text-[#f5f6fa]/80">
                                <span
                                  className={`block h-[1vh] aspect-square shrink-0 rounded-full border ${r === 0 ? "border-[#aeb8e8] bg-[#aeb8e8]" : "border-white/30"}`}
                                />
                                {row}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </AnimatedHoverCard.Content>
                    </AnimatedHoverCard.Root>
                  ) : (
                    <h3 className="text-30">{c.title}</h3>
                  )}
                  <p className="text-24 text-vey-slate">{c.text}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};

export default Platform;
