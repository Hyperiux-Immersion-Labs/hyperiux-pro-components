// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { prefersReducedMotion } from "../Animations/reducedMotion";
import Roll from "../Animations/Roll";

// Each layer's spans across the run, as [start, end] in percent of the 4.2 s run
const LANES: { name: string; spans: [number, number][]; thin?: boolean }[] = [
  { name: "Runtime", spans: [[0, 100]], thin: true },
  { name: "Memory", spans: [[4, 20], [52, 60]] },
  { name: "Tools", spans: [[12, 44], [62, 70]] },
  { name: "Guard", spans: [[20, 23], [45, 48], [71, 74]] },
  { name: "Evals", spans: [[76, 90]] },
  { name: "Observe", spans: [[0, 100]], thin: true },
];

const RUN_MS = 4200;

// Platform hero visual: a live trace of one run. A playhead sweeps the six layers, spans fill in as it
// passes, the clock counts up and the run settles, then it replays.
const TraceViewer = () => {
  const root = useRef<HTMLDivElement>(null);
  // The run clock, in 100 ms steps so each digit has time to roll
  const [ms, setMs] = useState(0);

  useGSAP(
    () => {
      const spans = gsap.utils.toArray<HTMLElement>("[data-tv-span]", root.current);
      if (prefersReducedMotion()) {
        gsap.set(spans, { scaleX: 1 });
        gsap.set("[data-tv-done]", { opacity: 1 });
        setMs(RUN_MS);
        return;
      }
      const t = { p: 0 };
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.4 });
      gsap.set(spans, { scaleX: 0 });
      tl.set("[data-tv-done]", { opacity: 0 }, 0)
        .set("[data-tv-head]", { left: "0%", opacity: 1 }, 0)
        .to(t, {
          p: 1,
          duration: 4.2,
          ease: "none",
          onUpdate: () => {
            const next = Math.round((t.p * RUN_MS) / 100) * 100;
            setMs((cur) => (cur === next ? cur : next));
          },
        }, 0)
        .to("[data-tv-head]", { left: "100%", duration: 4.2, ease: "none" }, 0);
      // A span fills from its own start to its own end while the playhead is inside it
      spans.forEach((span) => {
        const from = Number(span.dataset.from) / 100;
        const to = Number(span.dataset.to) / 100;
        tl.to(span, { scaleX: 1, duration: (to - from) * 4.2, ease: "none" }, from * 4.2);
      });
      tl.to("[data-tv-head]", { opacity: 0, duration: 0.3 }, 4.2)
        .to("[data-tv-done]", { opacity: 1, duration: 0.4, ease: "power2.out" }, 4.2)
        .to({}, { duration: 1.6 })
        .to(spans, { opacity: 0, duration: 0.4 })
        .set(spans, { scaleX: 0, opacity: 1 });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="flex flex-col border border-(--ord-bone)/12 bg-(--ord-ink)/40">
      <div className="flex items-center justify-between border-b border-(--ord-bone)/12 px-[1.4vw] py-[1.6vh] ord-label text-14 uppercase text-ord-stone max-lg:px-[3vw] max-md:px-[4vw]">
        <span>Trace / run 8821</span>
        <span className="text-ord-primary-light">
          <Roll value={ms.toLocaleString("en-US")} />{" "}
          ms
        </span>
      </div>
      <div className="relative flex flex-col gap-[1.6vh] px-[1.4vw] py-[2.4vh] max-lg:px-[3vw] max-md:px-[4vw]">
        {LANES.map((lane) => (
          <div key={lane.name} className="flex items-center gap-4">
            <span className="w-[6vw] shrink-0 ord-label text-14 uppercase text-ord-ash max-lg:w-[14vw] max-md:w-[20vw]">{lane.name}</span>
            <span className="relative block h-[2.2vh] flex-1 bg-(--ord-bone)/[0.04]">
              {lane.spans.map(([from, to]) => (
                <span
                  key={from}
                  data-tv-span
                  data-from={from}
                  data-to={to}
                  className={`absolute origin-left [transform:scaleX(0)] ${lane.thin ? "top-1/2 h-px -translate-y-1/2 bg-(--ord-primary)/70" : "inset-y-0 bg-(--ord-primary) shadow-[0_0_1.6vh_rgba(var(--ord-primary-light-rgb),0.45)]"}`}
                  style={{ left: `${from}%`, width: `${to - from}%` }}
                />
              ))}
            </span>
          </div>
        ))}
        {/* The playhead runs over the lanes only, past the labels */}
        <span className="pointer-events-none absolute inset-y-[1.6vh] right-[1.4vw] left-[calc(1.4vw+6vw+1rem)] max-lg:left-[calc(3vw+14vw+1rem)] max-lg:right-[3vw] max-md:left-[calc(4vw+20vw+1rem)] max-md:right-[4vw]">
          <span data-tv-head className="absolute inset-y-0 block w-px bg-(--ord-primary-light) shadow-[0_0_1.2vh_var(--ord-primary-light)]" />
        </span>
      </div>
      <div className="flex items-center justify-between border-t border-(--ord-bone)/12 px-[1.4vw] py-[1.6vh] ord-label text-14 uppercase max-lg:px-[3vw] max-md:px-[4vw]">
        <span className="text-ord-stone">9 steps / 4 agents / 27 policy checks</span>
        <span data-tv-done className="text-ord-primary-light opacity-0">
          Settled / USD 0.031
        </span>
      </div>
    </div>
  );
};

export default TraceViewer;
