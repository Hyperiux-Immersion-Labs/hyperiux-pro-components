// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import Lines from "./Animations/Lines";
import { countUp, lineIn, useReveal } from "./Animations/scene";
import { prefersReducedMotion, useReducedMotion } from "./Animations/reducedMotion";
import { smooth, type Point } from "./Animations/paths";
import { Icon, Mark } from "./Icons";
import { FloatingTooltip, FloatingTooltipProvider } from "./effects/animated-tooltip";
import { CheckboxGroup, CheckboxItem, RollingNumber } from "./effects/animated-checkbox-group";
import { Plus } from "./effects/animated-toggle";
import { brand, dashboard } from "../content";

const CW = 600;
const CH = 200;
const SAMPLES = 12;

function resample(values: number[]) {
  return Array.from({ length: SAMPLES }, (_, i) => {
    const t = (i / (SAMPLES - 1)) * (values.length - 1);
    const a = Math.floor(t);
    const b = Math.min(values.length - 1, a + 1);
    return values[a] + (values[b] - values[a]) * (t - a);
  });
}

function chartPaths(values: number[]) {
  const pts: Point[] = resample(values).map((v, i) => [(i / (SAMPLES - 1)) * CW, CH - 16 - (v / 80) * (CH - 32)]);
  const line = smooth(pts, 0.8);
  return { line, area: `${line} L${CW},${CH} L0,${CH} Z` };
}

const STATUS_NOTE: Record<string, string> = {
  Running: "Live now, processing new items as they arrive.",
  Scheduled: "Queued for its next scheduled run.",
  Paused: "Waiting for an owner to resume it.",
};

const STATUS_STYLE: Record<string, string> = {
  Running: "bg-[#e8eaf5] text-[#202b4a]",
  Scheduled: "bg-[#f7f7f5] text-[#73798a]",
  Paused: "bg-[#f7f7f5] text-[#73798a]",
};

const PANEL =
  "rounded-md border border-[#e2e4ec] bg-white px-[1.2vw] py-[1.2vw] max-lg:px-[2.2vw] max-lg:py-[2.2vw] max-md:px-[4.5vw] max-md:py-[4.5vw]";

const Dashboard = () => {
  const ref = useRef<HTMLElement>(null);
  const lineRef = useRef<SVGPathElement>(null);
  const areaRef = useRef<SVGPathElement>(null);
  const [range, setRange] = useState(0);
  const [tasks, setTasks] = useState(dashboard.tasks.filter((t) => t.done).map((t) => t.label));
  const [plusHover, setPlusHover] = useState(false);
  const initial = chartPaths(dashboard.ranges[0].points);

  useReveal(
    ref,
    (tl, { q, mobile }) => {
      lineIn(tl, q("[data-line]"), 0, 1);
      tl.fromTo(q("[data-desc]"), { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0 }, 0.2);
      tl.fromTo(q("[data-dash-frame]"), { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: 1.2 }, 0.3);
      tl.fromTo(
        q("[data-dash-side]"),
        { autoAlpha: 0, x: mobile ? 0 : -30, y: mobile ? 16 : 0 },
        { autoAlpha: 1, x: 0, y: 0, duration: 0.9 },
        0.7,
      );
      tl.fromTo(q("[data-dash-nav]"), { autoAlpha: 0, x: -12 }, { autoAlpha: 1, x: 0, duration: 0.5, stagger: 0.05 }, 0.9);
      tl.fromTo(q("[data-dash-main]"), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.08 }, 1.05);
      tl.fromTo(q("[data-dash-stat]"), { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08 }, 1.3);
      tl.add(() => {
        if (prefersReducedMotion()) return;
        q("[data-count]").forEach((el) => countUp(el, Number((el as HTMLElement).dataset.count), 0, 1.8));
      }, 1.35);
      tl.fromTo(
        lineRef.current,
        { drawSVG: "0%" },
        {
          drawSVG: "100%",
          duration: 1.6,
          ease: "power2.inOut",
          onComplete: () => void gsap.set(lineRef.current, { clearProps: "strokeDasharray,strokeDashoffset" }),
        },
        1.5,
      );
      tl.fromTo(areaRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2 }, 2);
      tl.fromTo(q("[data-dash-row]"), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.06 }, 1.8);
    },
    "top 65%",
  );

  const selectRange = (i: number) => {
    setRange(i);
    const next = chartPaths(dashboard.ranges[i].points);
    const d = prefersReducedMotion() ? 0 : 0.8;
    gsap.to(lineRef.current, { attr: { d: next.line }, duration: d, ease: "power3.inOut" });
    gsap.to(areaRef.current, { attr: { d: next.area }, duration: d, ease: "power3.inOut" });
  };

  const reduce = useReducedMotion();

  return (
    <section
      ref={ref}
      id="dashboard"
      aria-labelledby="dashboard-title"
      data-vey-tone="light"
      className="relative bg-vey-paper text-vey-ink"
    >
      <div className="flex flex-col gap-14 vey-container vey-section max-md:gap-10">
        <div className="flex items-end justify-between gap-10 max-lg:flex-col max-lg:items-start">
          <Lines id="dashboard-title" lines={dashboard.heading} className="w-[50%] max-lg:w-[80%] max-md:w-full" />
          <p data-desc className="w-[28%] text-28 text-vey-slate max-lg:w-[60%] max-md:w-full">
            {dashboard.description}
          </p>
        </div>

        <FloatingTooltipProvider changeAnimation="roll" rounded="md">
          <div data-dash-frame>
            <div className="vey-card-light overflow-hidden rounded-md">
              <div className="flex items-center justify-between gap-4 border-b border-[#e2e4ec] px-[1.2vw] py-[0.8vw] max-lg:px-[2.2vw] max-lg:py-[1.6vw] max-md:px-[4vw] max-md:py-[3vw]">
                <div className="flex items-center gap-2" aria-hidden>
                  {[0, 1, 2].map((d) => (
                    <span key={d} className="block h-[1.2vh] aspect-square rounded-full bg-[#e2e4ec]" />
                  ))}
                </div>
                <span className="rounded-md bg-[#f7f7f5] px-[1.6vw] py-[0.3vw] text-14 text-vey-slate max-lg:px-[3vw] max-lg:py-[0.6vw] max-md:px-[4vw] max-md:py-[1vw]">
                  app.{brand.name.toLowerCase()}.ai/overview
                </span>
                <span className="w-[3vw] max-md:hidden" />
              </div>

              <div className="flex max-md:flex-col">
                <aside
                  data-dash-side
                  className="flex w-[17%] flex-col justify-between gap-8 bg-[#151927] px-[1vw] py-[1.4vw] text-[#f5f6fa] max-lg:w-[24%] max-lg:px-[1.6vw] max-lg:py-[2.4vw] max-md:w-full max-md:px-[4vw] max-md:py-[4vw]"
                >
                  <div className="flex flex-col gap-6 max-md:gap-4">
                    <span className="flex items-center gap-2 px-[0.6vw] max-lg:px-[1vw] max-md:px-0">
                      <Mark className="h-[1vw] w-[1vw] max-lg:h-[2vw] max-lg:w-[2vw] max-md:h-[4vw] max-md:w-[4vw]" />
                      <span className="text-24 font-medium">{brand.name}</span>
                    </span>
                    <nav
                      aria-label="Workspace (demo)"
                      className="flex flex-col gap-1 max-md:flex-row max-md:gap-2 max-md:overflow-x-auto vey-scrollbar-none"
                    >
                      {dashboard.nav.map((item, i) => (
                        <span
                          key={item.label}
                          data-dash-nav
                          aria-current={i === 0 ? "page" : undefined}
                          className={`flex shrink-0 items-center gap-3 rounded-md px-[0.6vw] py-[0.5vw] text-22 max-lg:px-[1vw] max-lg:py-[1vw] max-md:px-[3vw] max-md:py-[2vw] ${
                            i === 0 ? "bg-white/10 text-[#f5f6fa]" : "text-[#f5f6fa]/55"
                          }`}
                        >
                          <Icon
                            name={item.icon}
                            className="h-[1vw] w-[1vw] max-lg:h-[2vw] max-lg:w-[2vw] max-md:h-[3.8vw] max-md:w-[3.8vw]"
                          />
                          {item.label}
                        </span>
                      ))}
                    </nav>
                  </div>
                  <div className="flex items-center gap-3 rounded-md bg-white/5 px-[0.6vw] py-[0.6vw] max-lg:px-[1vw] max-lg:py-[1vw] max-md:hidden">
                    <span className="flex h-[4vh] aspect-square items-center justify-center rounded-md bg-[#aeb8e8] text-14 font-medium text-[#0b1020]">
                      {dashboard.user[0]}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-22">{dashboard.user}</span>
                      <span className="text-14 text-[#f5f6fa]/55">Admin</span>
                    </div>
                  </div>
                </aside>

                <div className="flex flex-1 flex-col gap-5 bg-[#f7f7f5] px-[1.6vw] py-[1.6vw] max-lg:px-[2.4vw] max-lg:py-[2.4vw] max-md:gap-4 max-md:px-[4vw] max-md:py-[5vw]">
                  <div data-dash-main className="flex items-center justify-between gap-4 max-md:flex-col max-md:items-start">
                    <div className="flex flex-col gap-1">
                      <span className="text-40 font-medium">Good morning, {dashboard.user}</span>
                      <span className="text-22 text-vey-slate">{dashboard.date}. Here is what is happening today.</span>
                    </div>
                    <a
                      href="#pricing"
                      onPointerEnter={() => setPlusHover(true)}
                      onPointerLeave={() => setPlusHover(false)}
                      onFocus={() => setPlusHover(true)}
                      onBlur={() => setPlusHover(false)}
                      className="flex h-[5vh] items-center gap-3 rounded-md bg-[#151927] px-[1.2vw] text-22 text-[#f5f6fa] transition-colors duration-300 hover:bg-[#202b4a] max-lg:h-[3.8vh] max-lg:px-[2.4vw] max-md:h-[5.4vh] max-md:px-[5vw]"
                    >
                      <Plus
                        isHovered={plusHover}
                        prefersReducedMotion={reduce}
                        className="h-[0.8vw] w-[0.8vw] max-lg:h-[1.6vw] max-lg:w-[1.6vw] max-md:h-[3.4vw] max-md:w-[3.4vw]"
                      />
                      New workflow
                    </a>
                  </div>

                  <ul className="grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-md:gap-3">
                    {dashboard.stats.map((s) => (
                      <li key={s.label} data-dash-stat className={`${PANEL} flex flex-col gap-3`}>
                        <span className="text-22 text-vey-slate">{s.label}</span>
                        <div className="flex items-end justify-between gap-2">
                          <span data-count={s.value} className="text-40 font-medium tabular-nums">
                            {s.value.toLocaleString("en-US")}
                          </span>
                          <FloatingTooltip content={`${s.delta} vs last week`} description="Compared with the previous 7 days">
                            <span
                              tabIndex={0}
                              className="cursor-help rounded-md bg-[#e8eaf5] px-[0.5vw] py-[0.15vw] text-14 text-[#202b4a] outline-none transition-colors duration-300 hover:bg-[#aeb8e8] focus-visible:ring-2 focus-visible:ring-[#aeb8e8] max-lg:px-[1vw] max-lg:py-[0.3vw] max-md:px-[2vw] max-md:py-[0.6vw]"
                            >
                              {s.delta}
                            </span>
                          </FloatingTooltip>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="grid grid-cols-3 gap-4 max-lg:grid-cols-1 max-md:gap-3">
                    <div data-dash-main className={`${PANEL} col-span-2 flex flex-col gap-4 max-lg:col-span-1`}>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex flex-col">
                          <span className="text-24 font-medium">Productivity</span>
                          <span className="text-14 text-vey-slate">Tasks completed by agents and teammates</span>
                        </div>
                        <div
                          role="group"
                          aria-label="Chart range"
                          className="flex rounded-md bg-[#f7f7f5] px-[0.2vw] py-[0.2vw] max-lg:px-[0.4vw] max-lg:py-[0.4vw] max-md:px-[1vw] max-md:py-[1vw]"
                        >
                          {dashboard.ranges.map((r, i) => (
                            <button
                              key={r.label}
                              type="button"
                              aria-pressed={range === i}
                              onClick={() => selectRange(i)}
                              className={`rounded-md px-[0.8vw] py-[0.3vw] text-14 transition-colors duration-300 max-lg:px-[1.6vw] max-lg:py-[0.6vw] max-md:px-[3vw] max-md:py-[1.2vw] ${
                                range === i ? "bg-white text-[#151927] shadow-sm" : "text-[#73798a] hover:text-[#151927]"
                              }`}
                            >
                              {r.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <svg
                        viewBox={`0 0 ${CW} ${CH}`}
                        className="h-[24vh] w-full max-lg:h-[20vh] max-md:h-[22vh]"
                        preserveAspectRatio="none"
                        role="img"
                        aria-label={`Productivity trend, ${dashboard.ranges[range].label}`}
                      >
                        <defs>
                          <linearGradient id="vey-dash-area" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" stopColor="#aeb8e8" stopOpacity="0.45" />
                            <stop offset="1" stopColor="#aeb8e8" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        {[0.25, 0.5, 0.75].map((g) => (
                          <line key={g} x1="0" x2={CW} y1={CH * g} y2={CH * g} stroke="#e2e4ec" strokeDasharray="3 5" />
                        ))}
                        <path ref={areaRef} d={initial.area} fill="url(#vey-dash-area)" />
                        <path strokeLinecap="round" ref={lineRef} d={initial.line} fill="none" stroke="#202b4a" strokeWidth="1.6" />
                      </svg>
                    </div>

                    <div data-dash-main className={`${PANEL} flex flex-col gap-4`}>
                      <div className="flex items-center justify-between">
                        <span className="text-24 font-medium">Tasks</span>
                        <span className="text-14 text-vey-slate tabular-nums" aria-live="polite">
                          <RollingNumber value={tasks.length} />/{dashboard.tasks.length} done
                        </span>
                      </div>
                      <CheckboxGroup value={tasks} onValueChange={setTasks} aria-label="Today's tasks" className="gap-1">
                        {dashboard.tasks.map((t) => (
                          <CheckboxItem
                            key={t.label}
                            value={t.label}
                            label={t.label}
                            className="rounded-md px-[0.4vw] py-[0.5vw] text-22 transition-colors duration-300 hover:bg-[#f7f7f5] max-lg:px-[0.8vw] max-lg:py-[1vw] max-md:px-[2vw] max-md:py-[2vw]"
                          />
                        ))}
                      </CheckboxGroup>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 max-lg:grid-cols-1 max-md:gap-3">
                    <div data-dash-main className={`${PANEL} col-span-2 flex flex-col gap-3 max-lg:col-span-1`}>
                      <span className="text-24 font-medium">Recent workflows</span>
                      <ul className="flex flex-col">
                        {dashboard.workflows.map((w) => (
                          <li
                            key={w.name}
                            data-dash-row
                            className="grid grid-cols-[1fr_auto_auto] items-center gap-6 border-t border-[#e2e4ec] py-[0.7vw] max-lg:py-[1.4vw] max-md:grid-cols-[1fr_auto] max-md:py-[3vw]"
                          >
                            <span className="flex items-center gap-3 text-22">
                              <Icon
                                name="flow"
                                className="h-[1vw] w-[1vw] text-[#73798a] max-lg:h-[2vw] max-lg:w-[2vw] max-md:h-[4vw] max-md:w-[4vw]"
                              />
                              {w.name}
                            </span>
                            <span className="text-14 text-vey-slate tabular-nums max-md:hidden">{w.runs.toLocaleString("en-US")} runs</span>
                            <FloatingTooltip content={w.status} description={STATUS_NOTE[w.status]}>
                              <span
                                tabIndex={0}
                                className={`cursor-help rounded-md px-[0.6vw] py-[0.2vw] text-14 outline-none focus-visible:ring-2 focus-visible:ring-[#aeb8e8] max-lg:px-[1.2vw] max-lg:py-[0.4vw] max-md:px-[2.4vw] max-md:py-[0.8vw] ${STATUS_STYLE[w.status]}`}
                              >
                                {w.status}
                              </span>
                            </FloatingTooltip>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div data-dash-main className={`${PANEL} flex flex-col gap-3`}>
                      <span className="text-24 font-medium">Recent activity</span>
                      <ul className="flex flex-col gap-3">
                        {dashboard.activity.map((a) => (
                          <li key={a.what} data-dash-row className="flex items-start gap-3">
                            <span className="flex h-[3.4vh] aspect-square shrink-0 items-center justify-center rounded-md bg-[#e8eaf5] text-14 text-[#202b4a]">
                              {a.who[0]}
                            </span>
                            <span className="flex-1 text-22">
                              <span className="font-medium">{a.who}</span> <span className="text-vey-slate">{a.what}</span>
                            </span>
                            <span className="text-14 text-vey-slate">{a.when}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FloatingTooltipProvider>
      </div>
    </section>
  );
};

export default Dashboard;
