// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "../Animations/reducedMotion";
import { useResizeKey } from "../Animations/useResizeKey";
import LineReveal from "../Animations/LineReveal";
import Roll from "../Animations/Roll";
import { POLICY_TOUR } from "./content";
import { THEME, alpha } from "../../theme";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type Verdict = "allow" | "deny" | "hold";

// Each action names the policy that decides it (an index into POLICY_TOUR)
const ACTIONS: { label: string; agent: string; verdict: Verdict; policy: number }[] = [
  { label: "read ledger_q3", agent: "Researcher", verdict: "allow", policy: 0 },
  { label: "read payroll_2026", agent: "Analyst", verdict: "deny", policy: 0 },
  { label: "query contracts", agent: "Researcher", verdict: "allow", policy: 0 },
  { label: "call model, USD 0.004", agent: "Planner", verdict: "allow", policy: 1 },
  { label: "wire USD 48,000", agent: "Courier", verdict: "deny", policy: 1 },
  { label: "email 14 vendors", agent: "Courier", verdict: "hold", policy: 2 },
  { label: "create Jira ticket", agent: "Courier", verdict: "hold", policy: 2 },
  { label: "write reconcile.sql", agent: "Coder", verdict: "allow", policy: 3 },
  { label: "drop table vendors", agent: "Coder", verdict: "deny", policy: 3 },
  { label: "sign run 8821", agent: "Critic", verdict: "allow", policy: 4 },
];

const STAMP: Record<Verdict, string> = { allow: "Allowed", deny: "Denied", hold: "Held for sign-off" };

const PolicyGate = () => {
  const root = useRef<HTMLElement>(null);
  // How many actions have crossed the gate; the counters roll to their share of these
  const [seen, setSeen] = useState(0);
  const resizeKey = useResizeKey();

  useGSAP(
    () => {
      const section = root.current;
      const column = section?.querySelector<HTMLElement>("[data-pg-column]");
      const gate = section?.querySelector<HTMLElement>("[data-pg-gate]");
      if (!section || !column || !gate) return;
      const chips = gsap.utils.toArray<HTMLElement>("[data-pg-chip]", section);
      const rules = gsap.utils.toArray<HTMLElement>("[data-pg-rule]", section);

      if (prefersReducedMotion()) {
        gsap.set(chips, { opacity: 1 });
        gsap.set("[data-pg-stamp]", { opacity: 1 });
        chips.forEach((chip, i) => {
          if (ACTIONS[i].verdict === "deny") gsap.set(chip.querySelector("[data-pg-strike]"), { scaleX: 1 });
          if (ACTIONS[i].verdict === "allow") gsap.set(chip, { borderColor: THEME.primary });
        });
        setSeen(ACTIONS.length);
        return;
      }

      // The column rises from below the gate to above it; a chip is judged the moment its middle meets the line
      const stage = column.parentElement!.getBoundingClientRect();
      const gateY = gate.getBoundingClientRect().top - stage.top;
      const startY = stage.height * 0.92;
      const endY = -column.offsetHeight + stage.height * 0.08;
      gsap.set(column, { y: startY });
      const crossings = chips.map((chip) => {
        const mid = chip.offsetTop + chip.offsetHeight / 2;
        return Math.min(Math.max((startY + mid - gateY) / (startY - endY), 0), 1);
      });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8,
          onUpdate: (self) => {
            // Counters and the active rule follow the scroll exactly, in both directions
            const p = self.progress;
            const seen = ACTIONS.filter((_, i) => crossings[i] <= p);
            setSeen(seen.length);
            const active = seen.length ? seen[seen.length - 1].policy : -1;
            rules.forEach((r, i) => r.toggleAttribute("data-active", i === active));
          },
        },
      });
      tl.to(column, { y: endY, duration: 1 }, 0);

      chips.forEach((chip, i) => {
        const t = crossings[i];
        const a = ACTIONS[i];
        const stamp = chip.querySelector("[data-pg-stamp]");
        const strike = chip.querySelector("[data-pg-strike]");
        // A hit only brightens the line and its glow; the line keeps its thickness
        tl.to(gate, { opacity: 1, boxShadow: `0 0 3vh ${THEME.primaryLight}`, duration: 0.008 }, t).to(gate, { opacity: 0.6, boxShadow: `0 0 2vh ${THEME.primaryLight}`, duration: 0.03 }, t + 0.008);
        tl.fromTo(stamp, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.02 }, t);
        if (a.verdict === "allow") {
          tl.to(chip, { backgroundColor: THEME.primary, borderColor: THEME.primary, color: THEME.ink, duration: 0.015 }, t);
        } else if (a.verdict === "deny") {
          tl.to(strike, { scaleX: 1, duration: 0.015 }, t)
            .to(chip, { borderColor: alpha(THEME.bone, 0.6), duration: 0.01 }, t)
            .to(chip, { x: "8vw", rotate: 5, opacity: 0, duration: 0.07, ease: "power2.in" }, t + 0.02);
        } else {
          tl.to(chip, { borderColor: THEME.primaryLight, color: THEME.primaryLight, duration: 0.015 }, t)
            .to(chip, { x: "-3vw", scale: 0.94, duration: 0.05, ease: "power3.out" }, t + 0.015);
        }
      });
    },
    { scope: root, dependencies: [resizeKey], revertOnUpdate: true },
  );

  return (
    <section ref={root} data-ord-orb="governance-gate" data-ord-chapter="Policy gate" className="relative h-[320vh] motion-reduce:h-auto!">
      <div className="sticky top-0 flex h-screen items-stretch motion-reduce:static motion-reduce:h-auto motion-reduce:items-start justify-between gap-10 overflow-hidden ord-container py-[12vh] max-lg:flex-col max-lg:py-[10vh]">
        {/* Top-aligned, so the heading holds still while the rules below open and close */}
        <div className="flex w-[30%] flex-col justify-start gap-10 pt-[4vh] max-lg:w-full max-lg:gap-4 max-lg:pt-0">
          <LineReveal>
            <h2>
              Every action <span className="text-ord-stone">meets the gate.</span>
            </h2>
          </LineReveal>
          <ul className="flex flex-col max-lg:hidden">
            {POLICY_TOUR.map((p, i) => (
              <li
                key={p.name}
                data-pg-rule
                className="group/rule flex items-baseline gap-5 border-t border-(--ord-bone)/10 py-[1.4vh] opacity-40 transition-opacity duration-500 last:border-b data-[active]:opacity-100"
              >
                <span className="ord-label text-14 text-ord-primary-light">{String(i + 1).padStart(2, "0")}</span>
                <span className="flex flex-col">
                  <span className="text-30">{p.title}</span>
                  {/* Accordion: the row animates from 0fr to 1fr, so the body opens smoothly and pushes the rules below */}
                  <span className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] group-data-[active]/rule:grid-rows-[1fr]">
                    <span className="overflow-hidden">
                      <span className="block pt-1 text-22 text-ord-stone opacity-0 transition-opacity duration-500 group-data-[active]/rule:opacity-100 group-data-[active]/rule:delay-200">
                        {p.body}
                      </span>
                    </span>
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative w-[38%] max-lg:w-full max-lg:flex-1">
        <div className="relative h-full overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,#000_16%,#000_84%,transparent)] motion-reduce:overflow-visible motion-reduce:[mask-image:none]">
          <div data-pg-column className="absolute inset-x-0 top-0 motion-reduce:relative flex flex-col items-center gap-[2.4vh]">
            {ACTIONS.map((a) => (
              <div
                key={a.label}
                data-pg-chip
                className="relative flex w-[78%] items-center justify-between gap-4 border border-(--ord-bone)/25 px-[1vw] py-[1.4vh] ord-label text-14 text-ord-bone max-lg:w-[90%] max-lg:px-[3vw]"
              >
                <span className="flex flex-col gap-1">
                  <span className="relative text-22 normal-case">
                    {a.label}()
                    <span data-pg-strike className="absolute inset-x-0 top-1/2 block h-px origin-left bg-current [transform:scaleX(0)]" />
                  </span>
                  <span className="uppercase opacity-60">{a.agent}</span>
                </span>
                <span className="overflow-hidden">
                  <span data-pg-stamp className="block uppercase opacity-0">
                    {STAMP[a.verdict]}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
          {/* The gate runs past both edges of the column and sits over the chips, so every request passes through it */}
          <div className="pointer-events-none absolute -inset-x-[2.5vw] top-1/2 z-10 -translate-y-1/2 motion-reduce:hidden max-lg:-inset-x-[2vw]">
            <span className="absolute bottom-[1.2vh] right-0 ord-label text-14 uppercase text-ord-primary-light">Policy engine</span>
            <span data-pg-gate className="block h-[2px] w-full origin-center bg-(--ord-primary-light) opacity-60 shadow-[0_0_2vh_var(--ord-primary-light)]" />
          </div>
        </div>

        <dl className="flex w-[18%] flex-col justify-center gap-8 max-lg:w-full max-lg:flex-row max-lg:justify-between">
          {(
            [
              ["allow", "Allowed"],
              ["deny", "Denied"],
              ["hold", "Held"],
            ] as const
          ).map(([k, label]) => (
            <div key={k} className="flex flex-col gap-1 border-t border-(--ord-bone)/10 pt-[1.6vh]">
              <dt className="ord-label text-14 uppercase text-ord-stone">{label}</dt>
              <dd className={`text-64 leading-none ${k === "allow" ? "text-ord-primary-light" : k === "hold" ? "text-ord-primary" : "text-ord-bone"}`}>
                <Roll value={String(ACTIONS.slice(0, seen).filter((a) => a.verdict === k).length).padStart(2, "0")} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
};

export default PolicyGate;
