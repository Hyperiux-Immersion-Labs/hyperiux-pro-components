// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { prefersReducedMotion } from "../Animations/reducedMotion";
import { useReveal } from "../Animations/useReveal";
import LineReveal from "../Animations/LineReveal";
import { THEME } from "../../theme";
import Roll from "../Animations/Roll";
import { HX_DARK } from "../hxPalette";
import { Slider, SliderScope } from "../effects/animated-slider";

gsap.registerPlugin(useGSAP);

// Sample rates for the estimator. Replace them with your own pricing.
const MIN_RUNS = 1_000;
const MAX_RUNS = 2_000_000;
const FREE_RUNS = 10_000;
const SCALE_RATE = 0.0009;
const ENTERPRISE_FROM = 500_000;
const ENTERPRISE_RATE = 0.0006;

// Rounded to three significant figures, so a drag turns over the leading digits instead of churning the ones
const runsAt = (t: number) => {
  const raw = MIN_RUNS * Math.pow(MAX_RUNS / MIN_RUNS, t);
  const unit = Math.pow(10, Math.max(Math.floor(Math.log10(raw)) - 2, 0));
  return Math.round(raw / unit) * unit;
};

// Holds a fast-changing value to one update per interval, so each rolling digit settles before it moves again
const useThrottled = <T,>(value: T, ms: number) => {
  const [shown, setShown] = useState(value);
  const last = useRef(0);
  useEffect(() => {
    const wait = Math.max(0, last.current + ms - performance.now());
    const id = window.setTimeout(() => {
      last.current = performance.now();
      setShown(value);
    }, wait);
    return () => clearTimeout(id);
  }, [value, ms]);
  return shown;
};

const planFor = (runs: number) => (runs <= FREE_RUNS ? 0 : runs < ENTERPRISE_FROM ? 1 : 2);

const costFor = (runs: number) => {
  const plan = planFor(runs);
  if (plan === 0) return 0;
  if (plan === 1) return 49 + (runs - FREE_RUNS) * SCALE_RATE;
  return 49 + (ENTERPRISE_FROM - FREE_RUNS) * SCALE_RATE + (runs - ENTERPRISE_FROM) * ENTERPRISE_RATE;
};

const PLANS = [
  { name: "Starter", note: "Free up to 10,000 runs" },
  { name: "Scale", note: "USD 49 plus 0.09 cents a run" },
  { name: "Enterprise", note: "Volume rate above 500,000 runs" },
];

const W = 600;
const H = 220;
const MAX_COST = costFor(MAX_RUNS);

// Pricing page signature: drag the volume and watch the bill, the curve and the right plan respond
const CostEstimator = () => {
  const root = useRef<HTMLElement>(null);
  // The slider runs 0-1000 on a log scale between MIN_RUNS and MAX_RUNS
  const [step, setStep] = useState(450);
  const t = step / 1000;
  const runs = runsAt(t);
  const plan = planFor(runs);
  const shownRuns = useThrottled(runs, 140);
  useReveal(root);

  // The cost curve across the whole slider, in a 0-1 log space so small teams still see a slope
  const path = useMemo(() => {
    const pts = Array.from({ length: 80 }, (_, i) => {
      const k = i / 79;
      const y = Math.log1p(costFor(runsAt(k))) / Math.log1p(MAX_COST);
      return `${(k * W).toFixed(1)},${(H - y * H * 0.92).toFixed(1)}`;
    });
    return `M${pts.join(" L")}`;
  }, []);
  const dotY = H - (Math.log1p(costFor(runs)) / Math.log1p(MAX_COST)) * H * 0.92;

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      // Pulse the radius, not a scale: a transform would keep a stale origin and pull the dot off the curve
      gsap.fromTo("[data-ce-dot]", { attr: { r: 10 } }, { attr: { r: 6 }, duration: 0.5, ease: "expo.out", overwrite: true });
    },
    { scope: root, dependencies: [runs] },
  );

  return (
    <section ref={root} data-ord-orb="pricing-estimate" data-ord-chapter="Estimate" className="relative ord-section">
      <div className="flex flex-col gap-14 ord-container max-md:gap-8">
        <div className="flex items-end justify-between gap-10 max-lg:flex-col max-lg:items-start max-lg:gap-4">
          <LineReveal className="w-[50%] max-lg:w-full">
            <h2>
              See your bill <span className="text-ord-stone">before you get it.</span>
            </h2>
          </LineReveal>
          <LineReveal className="w-[28%] max-lg:w-[70%] max-md:w-full" delay={0.15}>
            <p className="text-28 text-ord-ash">Drag the volume. The price, the curve and the right plan follow.</p>
          </LineReveal>
        </div>

        <div data-ord-reveal className="grid grid-cols-[1fr_1.3fr] border border-(--ord-bone)/12 max-lg:grid-cols-1">
          <div className="flex flex-col justify-between gap-10 border-r border-(--ord-bone)/12 px-[2.2vw] py-[2.4vw] max-lg:border-r-0 max-lg:border-b max-lg:px-[4vw] max-lg:py-[4vw] max-md:px-[5vw] max-md:py-[6vw]">
            <div className="flex flex-col gap-3">
              <span className="ord-label text-14 uppercase text-ord-stone">Runs per month</span>
              <span className="text-64 leading-none">
                <Roll value={shownRuns.toLocaleString("en-US")} />
              </span>
            </div>
            <div className="flex flex-col gap-3">
              <SliderScope palette={HX_DARK}>
                <Slider
                  aria-label="Runs per month"
                  min={0}
                  max={1000}
                  step={1}
                  value={step}
                  onValueChange={(v) => setStep(v as number)}
                  labels="none"
                  bubble="none"
                  rounded="none"
                  thickenOn="hover"
                  elastic
                />
              </SliderScope>
              <span className="flex justify-between ord-label text-14 uppercase text-ord-stone">
                <span>1k</span>
                <span>2M</span>
              </span>
            </div>
            <div className="flex flex-col gap-2 border-t border-(--ord-bone)/10 pt-[2vh]">
              <span className="ord-label text-14 uppercase text-ord-stone">Estimated per month</span>
              <span className="flex items-baseline gap-2 text-128 leading-none text-ord-primary-light">
                <span className="text-40 text-ord-stone">$</span>
                <Roll value={Math.round(costFor(shownRuns)).toLocaleString("en-US")} />
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-8 px-[2.2vw] py-[2.4vw] max-lg:px-[4vw] max-lg:py-[4vw] max-md:px-[5vw] max-md:py-[6vw]">
            <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full overflow-visible" aria-hidden>
              {[0.25, 0.5, 0.75].map((g) => (
                <line key={g} x1="0" x2={W} y1={H * g} y2={H * g} stroke={THEME.bone} strokeOpacity="0.06" />
              ))}
              <path d={`${path} L${W},${H} L0,${H}Z`} fill="url(#ce-fill)" />
              <path d={path} fill="none" stroke={THEME.primary} strokeWidth="1.5" />
              <line x1={t * W} x2={t * W} y1={dotY} y2={H} stroke={THEME.primaryLight} strokeOpacity="0.4" strokeDasharray="3 4" />
              <circle data-ce-dot cx={t * W} cy={dotY} r="6" fill={THEME.primaryLight} />
              <circle cx={t * W} cy={dotY} r="14" fill={THEME.primaryLight} fillOpacity="0.12" />
              <defs>
                <linearGradient id="ce-fill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor={THEME.primary} stopOpacity="0.22" />
                  <stop offset="1" stopColor={THEME.primary} stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
            <ul className="grid grid-cols-3 gap-3 max-md:grid-cols-1">
              {PLANS.map((p, i) => (
                <li
                  key={p.name}
                  data-active={plan === i || undefined}
                  className="flex flex-col gap-2 border border-(--ord-bone)/12 px-[1vw] py-[1.8vh] transition-colors duration-500 data-[active]:border-(--ord-primary) data-[active]:bg-(--ord-primary) data-[active]:text-(--ord-on-primary) max-lg:px-[2.4vw] max-md:px-[4vw]"
                >
                  <span className="flex items-center justify-between">
                    <span className="text-30">{p.name}</span>
                    <span className={`h-[0.8vh] aspect-square rounded-full transition-colors duration-500 ${plan === i ? "bg-(--ord-on-primary)" : "bg-(--ord-bone)/15"}`} />
                  </span>
                  <span className={`text-22 transition-colors duration-500 ${plan === i ? "text-(--ord-on-primary)/70" : "text-ord-stone"}`}>{p.note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CostEstimator;
