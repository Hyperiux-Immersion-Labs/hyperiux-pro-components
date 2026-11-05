// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "./Animations/reducedMotion";
import { useReveal } from "./Animations/useReveal";
import LineReveal from "./Animations/LineReveal";
import { OrdButton } from "./Buttons";
import { ROUTES } from "./nav";
import Icon, { type IconName } from "./Icon";
import Roll from "./Animations/Roll";
import ScrambleText from "./effects/scramble-text";
import { THEME } from "../theme";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const STATS: { icon: IconName; value: number; decimals: number; suffix: string; label: string }[] = [
  { icon: "layers", value: 2.4, decimals: 1, suffix: "B", label: "Tokens routed every day" },
  { icon: "bolt", value: 142, decimals: 0, suffix: "ms", label: "Median routing latency" },
  { icon: "shield", value: 99.99, decimals: 2, suffix: "%", label: "Runs finished without a retry" },
  { icon: "trend", value: 38, decimals: 0, suffix: "%", label: "Lower inference spend" },
];

const REPORT: { icon: IconName; agent: string; summary: string; time: string }[] = [
  { icon: "search", agent: "Planner", summary: "Split job_8821 into 9 steps across 4 agents.", time: "0.4s" },
  { icon: "analyze", agent: "Analyst", summary: "Reconciled 312 ledger rows, flagged 14 invoices over budget.", time: "1.6s" },
  { icon: "shield", agent: "Guard", summary: "Denied one wire transfer above the spend ceiling.", time: "0.2s" },
  { icon: "doc", agent: "Courier", summary: "Drafted 14 vendor emails and queued them for sign-off.", time: "2.0s" },
];

const LINE = "border-(--ord-ink)/12";

const Metrics = () => {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from("[data-ord-tick]", {
        scale: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: "back.out(2)",
        scrollTrigger: { trigger: "[data-ord-report]", start: "top 70%", once: true },
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} data-ord-orb="metrics" data-ord-light className="relative bg-ord-bone text-ord-ink">
      <div className="flex flex-col gap-16 ord-container ord-section max-md:gap-10">
        <LineReveal className="w-[64%] max-lg:w-full">
          <h2>
            Built for the work agents actually create.{" "}
            <span className="text-(--ord-text-muted)">Measured, not promised.</span>
          </h2>
        </LineReveal>
        <div className={`grid grid-cols-4 border ${LINE} max-md:grid-cols-2`}>
          {STATS.map((s, i) => (
            <div
              key={s.label}
              data-ord-reveal
              className={`ord-draw flex flex-col gap-10 ${LINE} px-[1.6vw] py-[1.8vw] transition-colors duration-500 hover:bg-white/50 max-lg:px-[2.6vw] max-lg:py-[3vw] max-md:gap-6 max-md:px-[4vw] max-md:py-[5vw] ${i > 0 ? "border-l" : ""} ${i === 2 ? "max-md:border-l-0" : ""} ${i > 1 ? "max-md:border-t" : ""}`}
            >
              <Icon
                name={s.icon}
                className="h-[2.6vh] aspect-square self-start text-ord-primary-deep max-lg:h-[2vh] max-md:h-[2.8vh]"
              />
              <div className="flex flex-col gap-2">
                <div className="flex items-end leading-none">
                  <span className="text-64"><Roll reveal value={s.value.toFixed(s.decimals)} /></span>
                  <span className="text-64 text-ord-primary-deep">{s.suffix}</span>
                </div>
                <p className="text-22 text-(--ord-text-muted)">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
        <div data-ord-report data-ord-reveal className={`flex items-stretch border ${LINE} bg-white/45 max-lg:flex-col`}>
          <div className="flex flex-1 flex-col px-[1.6vw] py-[1.4vw] max-lg:px-[3vw] max-lg:py-[3vw] max-md:px-[4vw] max-md:py-[5vw]">
            <div className="flex items-center justify-between gap-4 py-[0.8vw] max-lg:py-[1.4vw] max-md:py-[2vw]">
              <span className="flex items-center gap-3 text-22 font-medium">
                <span aria-hidden className="h-[0.8vh] aspect-square bg-(--ord-primary) max-md:h-[1vh]" />
                <ScrambleText text="Execution report / job_8821" />
              </span>
              <span className="ord-label text-14 uppercase text-(--ord-text-muted)">Completed in 4.2s</span>
            </div>
            <ul className="flex flex-col">
              {REPORT.map((row) => (
                <li
                  key={row.agent}
                  className={`ord-draw group/row flex items-center gap-6 border-t ${LINE} py-[1.1vw] transition-colors duration-300 hover:bg-(--ord-primary)/10 max-lg:py-[2vw] max-md:gap-3 max-md:py-[4vw]`}
                >
                  <Icon name={row.icon} className="h-[2.2vh] aspect-square text-ord-primary-deep max-lg:h-[1.6vh] max-md:h-[2.4vh]" />
                  <span className="w-[16%] text-22 font-medium transition-transform duration-500 ease-[cubic-bezier(0.7,0,0.2,1)] group-hover/row:[transform:translateX(0.4vw)] max-md:flex-1">
                    {row.agent}
                  </span>
                  <span className="flex-1 text-22 text-(--ord-text-muted) max-md:hidden">{row.summary}</span>
                  <span className="ord-label text-14 text-(--ord-text-muted)">{row.time}</span>
                  <span data-ord-tick className="flex h-[2.4vh] aspect-square items-center justify-center bg-(--ord-primary) text-ord-ink max-lg:h-[1.8vh] max-md:h-[2.6vh]">
                    <Icon name="check" className="h-[70%] aspect-square" />
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className={`flex w-[28%] flex-col justify-center gap-6 border-l ${LINE} px-[1.6vw] py-[1.6vw] max-lg:w-full max-lg:border-t max-lg:border-l-0 max-lg:px-[3vw] max-lg:py-[3vw] max-md:px-[4vw] max-md:py-[5vw]`}>
            <div className="flex items-center gap-4">
              <span className="flex h-[4.4vh] aspect-square items-center justify-center bg-ord-ink text-(--ord-primary-light) max-lg:h-[3.2vh] max-md:h-[4.6vh]">
                <Icon name="check-circle" className="h-[55%] aspect-square" />
              </span>
              <div className="flex flex-col">
                <span className="text-24 font-medium">Run settled</span>
                <span className="text-22 text-(--ord-text-muted)">14 drafts waiting for sign-off.</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 ord-label text-14 uppercase text-(--ord-text-muted)">
              <span className={`flex justify-between border-t ${LINE} pt-3`}>
                <span>Cost</span>
                <span className="text-ord-ink">USD 0.031</span>
              </span>
              <span className={`flex justify-between border-t ${LINE} pt-3`}>
                <span>Policies checked</span>
                <span className="text-ord-ink">27 / 27</span>
              </span>
            </div>
            <OrdButton href={ROUTES.governance} variant="inkLine" className="justify-between">
              Open the trace
            </OrdButton>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Metrics;
