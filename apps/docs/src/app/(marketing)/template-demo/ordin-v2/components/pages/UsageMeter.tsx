// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { prefersReducedMotion } from "../Animations/reducedMotion";
import Roll from "../Animations/Roll";

const RUNS = [
  { id: "8821", job: "Reconcile Q3 invoices", cost: 0.031 },
  { id: "8822", job: "Summarise support tickets", cost: 0.018 },
  { id: "8823", job: "Chase contract renewals", cost: 0.012 },
  { id: "8824", job: "Weekly revenue report", cost: 0.009 },
  { id: "8825", job: "Route inbound leads", cost: 0.007 },
];

const START_RUNS = 4_212;
const START_BILL = 38.4;

// Pricing hero visual: a live usage meter. Each finished run settles onto the bill as a line item,
// the run count and the total roll up, and the plan bar fills, then the list recycles.
const UsageMeter = () => {
  const root = useRef<HTMLDivElement>(null);
  const [totals, setTotals] = useState({ runs: START_RUNS, bill: START_BILL });

  useGSAP(
    () => {
      const rows = gsap.utils.toArray<HTMLElement>("[data-um-row]", root.current);
      if (prefersReducedMotion()) {
        gsap.set(rows, { opacity: 1 });
        return;
      }
      gsap.set(rows, { opacity: 0, y: -14 });
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.8 });
      rows.forEach((row, i) => {
        const at = i * 1.1;
        tl.to(row, { opacity: 1, y: 0, duration: 0.6, ease: "expo.out" }, at)
          .fromTo(row.querySelector("[data-um-tick]"), { scale: 0 }, { scale: 1, duration: 0.4, ease: "back.out(2.4)" }, at + 0.15)
          .call(() => setTotals((t) => ({ runs: t.runs + 1, bill: t.bill + RUNS[i].cost })), undefined, at + 0.2)
          .to("[data-um-bar]", { scaleX: `+=${0.05}`, duration: 0.5, ease: "power2.out" }, at + 0.2);
      });
      tl.to(rows, { opacity: 0, y: 14, duration: 0.5, stagger: 0.05, ease: "power2.in" }, ">0.6")
        .set(rows, { y: -14 })
        .to("[data-um-bar]", { scaleX: 0.42, duration: 0.6, ease: "power2.inOut" }, "<");
    },
    { scope: root },
  );

  return (
    <div ref={root} className="flex flex-col border border-(--ord-bone)/12 bg-(--ord-ink)/40">
      <div className="flex items-center justify-between border-b border-(--ord-bone)/12 px-[1.4vw] py-[1.6vh] ord-label text-14 uppercase text-ord-stone max-lg:px-[3vw] max-md:px-[4vw]">
        <span>Usage / November</span>
        <span className="flex items-center gap-2 text-ord-primary-light">
          <span className="h-[0.6vh] aspect-square rounded-full bg-(--ord-primary-light)" />
          Live
        </span>
      </div>
      <div className="grid grid-cols-2 border-b border-(--ord-bone)/12">
        <div className="flex flex-col gap-2 border-r border-(--ord-bone)/12 px-[1.4vw] py-[2.4vh] max-lg:px-[3vw] max-md:px-[4vw]">
          <span className="ord-label text-14 uppercase text-ord-stone">Finished runs</span>
          <span className="text-40 leading-none">
            <Roll value={totals.runs.toLocaleString("en-US")} />
          </span>
        </div>
        <div className="flex flex-col gap-2 px-[1.4vw] py-[2.4vh] max-lg:px-[3vw] max-md:px-[4vw]">
          <span className="ord-label text-14 uppercase text-ord-stone">Bill so far</span>
          <span className="text-40 leading-none tabular-nums">
            <Roll value={`$${totals.bill.toFixed(3)}`} />
          </span>
        </div>
      </div>
      <ul className="flex h-[26vh] flex-col overflow-hidden px-[1.4vw] py-[1vh] max-lg:px-[3vw] max-md:h-[30vh] max-md:px-[4vw]">
        {RUNS.map((r) => (
          <li key={r.id} data-um-row className="flex items-center gap-4 border-b border-(--ord-bone)/8 py-[1.3vh] last:border-0">
            <span data-um-tick className="flex h-[2vh] aspect-square shrink-0 items-center justify-center bg-(--ord-primary) text-ord-ink max-md:h-[2.4vh]">
              <svg aria-hidden viewBox="0 0 24 24" className="h-[70%] aspect-square" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            </span>
            <span className="ord-label text-14 uppercase text-ord-stone">Run {r.id}</span>
            <span className="min-w-0 flex-1 truncate text-22 text-ord-ash">{r.job}</span>
            <span className="ord-label text-14 text-ord-bone tabular-nums">${r.cost.toFixed(3)}</span>
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-2 border-t border-(--ord-bone)/12 px-[1.4vw] py-[2vh] max-lg:px-[3vw] max-md:px-[4vw]">
        <span className="flex justify-between ord-label text-14 uppercase text-ord-stone">
          <span>Scale plan</span>
          <span>Failed runs: never billed</span>
        </span>
        <span className="block h-px w-full bg-(--ord-bone)/10">
          <span data-um-bar className="block h-px w-full origin-left bg-(--ord-primary-light) [transform:scaleX(0.42)]" />
        </span>
      </div>
    </div>
  );
};

export default UsageMeter;
