// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef } from "react";
import Lines from "./Animations/Lines";
import { lineIn, useReveal } from "./Animations/scene";
import DraggableMarquee from "./effects/draggable-marquee";
import NumberCounter from "./effects/number-counter";
import { proof } from "../content";

const GLYPHS = [
  "M4 20 L12 4 L20 20 Z",
  "M12 3 a9 9 0 1 0 0.1 0 M12 8 a4 4 0 1 0 0.1 0",
  "M3 12 L12 3 L21 12 L12 21 Z M12 8 L16 12 L12 16 L8 12 Z",
  "M4 4 H20 V20 H4 Z M4 12 H20",
  "M3 12 C3 6 21 6 21 12 C21 18 3 18 3 12 Z M12 6 V18",
  "M5 5 L19 19 M19 5 L5 19 M12 3 V21",
];

const Proof = () => {
  const ref = useRef<HTMLElement>(null);

  useReveal(ref, (tl, { q }) => {
    lineIn(tl, q("[data-line]"), 0, 1);
    tl.fromTo(q("[data-marquee]"), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 1 }, 0.3);
    tl.fromTo(q("[data-metric-rule]"), { scaleX: 0 }, { scaleX: 1, duration: 1.2, stagger: 0.12, ease: "power2.inOut" }, 0.6);
    tl.fromTo(q("[data-metric]"), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, stagger: 0.12 }, 0.8);
    tl.fromTo(q("[data-note]"), { autoAlpha: 0 }, { autoAlpha: 1 }, 1.4);
  });

  return (
    <section
      ref={ref}
      id="customers"
      aria-labelledby="customers-title"
      data-vey-tone="light"
      className="relative bg-vey-paper text-vey-ink"
    >
      <div className="flex flex-col gap-16 vey-container vey-section max-md:gap-10">
        <div className="flex items-end justify-between gap-10 max-lg:flex-col max-lg:items-start max-md:gap-6">
          <Lines id="customers-title" lines={proof.heading} className="w-[50%] max-lg:w-[80%] max-md:w-full" />
          <p data-note className="w-[24%] text-14 text-vey-slate max-lg:w-[60%] max-md:w-full">
            {proof.logoNote} Drag the row to browse.
          </p>
        </div>

        <div data-marquee className="[mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
          <DraggableMarquee
            items={proof.logos.map((name, i) => ({ name, glyph: GLYPHS[i % GLYPHS.length] }))}
            getKey={(logo) => logo.name}
            gapClassName="gap-4 max-md:gap-3"
            speed={0.5}
            renderItem={(logo) => (
              <div className="group flex h-[14vh] w-[18vw] items-center justify-center gap-3 rounded-md border border-[#e2e4ec] bg-white text-[#151927]/70 transition-colors duration-300 hover:border-[#aeb8e8] hover:bg-[#e8eaf5] hover:text-[#151927] max-lg:h-[10vh] max-lg:w-[30vw] max-md:h-[11vh] max-md:w-[46vw]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                  aria-hidden
                  className="h-[1.6vw] w-[1.6vw] transition-transform duration-500 group-hover:rotate-45 max-lg:h-[3vw] max-lg:w-[3vw] max-md:h-[5vw] max-md:w-[5vw]"
                >
                  <path d={logo.glyph} />
                </svg>
                <span className="text-30 font-medium tracking-tight">{logo.name}</span>
              </div>
            )}
          />
        </div>

        <div className="flex flex-col gap-6">
          <ul className="grid grid-cols-3 gap-8 max-md:grid-cols-1 max-md:gap-8">
            {proof.metrics.map((m) => (
              <li key={m.label} className="flex flex-col gap-4">
                <span data-metric-rule className="block h-px w-full origin-left bg-[#151927]/15" />
                <div data-metric className="flex flex-col gap-2">
                  <span className="flex items-baseline text-128 font-medium tabular-nums leading-none">
                    <NumberCounter value={m.value.toFixed(m.decimals)} duration={1.8} />
                    <span className="text-vey-slate">{m.suffix}</span>
                  </span>
                  <span className="text-24 text-vey-slate">{m.label}</span>
                </div>
              </li>
            ))}
          </ul>
          <p data-note className="text-14 text-vey-slate">
            {proof.metricNote}
          </p>
        </div>
      </div>
    </section>
  );
};

export default Proof;
