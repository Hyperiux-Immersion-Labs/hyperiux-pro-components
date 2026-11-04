// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef } from "react";
import Scene from "./Scene";
import Lines from "./Animations/Lines";
import { fadeIn, useScene } from "./Animations/scene";
import TypingText, { syncTypingCues, type TypingCue } from "./effects/typing-text";
import { Icon } from "./Icons";
import { automation } from "../content";

const STATUS = ["Queued", "Running", "Done"];

function swap(tl: gsap.core.Timeline, labels: NodeListOf<Element> | Element[], from: number, to: number, at: number) {
  const list = Array.from(labels);
  tl.to(list[from], { autoAlpha: 0, y: -8, duration: 0.3 }, at);
  tl.fromTo(list[to], { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.3 }, at + 0.1);
}

const Automation = () => {
  const ref = useRef<HTMLElement>(null);
  const cues = useRef<TypingCue[]>([]);

  useScene(
    ref,
    (tl, { q }) => {
      fadeIn(tl, q("[data-before]"), 0.8, 20, 0.8);
      fadeIn(tl, q("[data-panel]"), 0.4, 40, 1.2);
      const steps = q("[data-auto-step]");
      tl.set(q("[data-status-label]"), { autoAlpha: 0 }, 0);
      steps.forEach((step) => tl.set(step.querySelectorAll("[data-status-label]")[0], { autoAlpha: 1 }, 0));
      tl.set(q("[data-run-label]"), { autoAlpha: 0 }, 0).set(q("[data-run-label]")[0], { autoAlpha: 1 }, 0);

      steps.forEach((step, i) => {
        const at = 1.6 + i * 1.3;
        const labels = step.querySelectorAll("[data-status-label]");
        swap(tl, labels, 0, 1, at);
        tl.fromTo(step, { autoAlpha: 0.45 }, { autoAlpha: 1, duration: 0.4 }, at);
        tl.fromTo(
          step.querySelector("[data-step-ring]"),
          { borderColor: "rgba(255,255,255,0.15)" },
          { borderColor: "#aeb8e8", duration: 0.3 },
          at,
        );
        tl.fromTo(step.querySelector("[data-step-num]"), { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.2 }, at + 0.9);
        tl.fromTo(step.querySelector("[data-step-fill]"), { scale: 0 }, { scale: 1, duration: 0.3, ease: "back.out(2)" }, at + 0.9);
        tl.fromTo(step.querySelector("[data-check] path"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.3 }, at + 1);
        swap(tl, labels, 1, 2, at + 0.9);
        const conn = step.querySelector("[data-step-conn]");
        if (conn) tl.fromTo(conn, { scaleY: 0 }, { scaleY: 1, duration: 0.5 }, at + 1);
        tl.to(q("[data-run-bar]"), { scaleX: (i + 1) / steps.length, duration: 0.6 }, at + 0.9);
        tl.set(q("[data-run-count]"), { textContent: String(i + 1) }, at + 0.9);
      });

      const end = 1.6 + steps.length * 1.3 + 0.2;
      swap(tl, q("[data-run-label]"), 0, 1, end);
      tl.fromTo(q("[data-summary]"), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power2.out" }, end + 0.2);
      fadeIn(tl, q("[data-after]"), end + 0.4, 20, 0.8);
      tl.to({}, { duration: 1 });
      cues.current = [{ at: (end + 0.45) / tl.duration(), el: q("[data-summary] [data-typing]")[0] }];
    },
    { onUpdate: (p) => syncTypingCues(cues.current, p) },
  );

  return (
    <Scene sectionRef={ref} id="automation" chapter={9} innerClassName="justify-center">
      <div className="flex items-center justify-between gap-10 vey-container max-lg:flex-col max-lg:items-start max-md:py-[16vw]">
        <div className="flex w-[34%] flex-col gap-8 max-lg:w-[80%] max-md:w-full">
          <Lines id="automation-title" lines={automation.heading} />
          <p data-desc className="text-28 text-vey-dim">
            {automation.description}
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[automation.before, automation.after].map((s, i) => (
              <div
                key={s.label}
                data-before={i === 0 ? "" : undefined}
                data-after={i === 1 ? "" : undefined}
                className="flex flex-col gap-2 border-t border-white/10 py-[1vw] max-lg:py-[2vw] max-md:py-[4vw]"
              >
                <span className={`text-14 uppercase tracking-wide ${i ? "text-vey-lilac" : "text-vey-dim"}`}>{s.label}</span>
                <span className="text-40">{s.value}</span>
                <span className="text-22 text-vey-dim">{s.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex w-[46%] flex-col gap-4 max-lg:w-full">
          <div
            data-panel
            className="flex flex-col gap-5 rounded-md border border-white/10 bg-linear-to-b from-[#161f38] to-[#0b1020] px-[1.6vw] py-[1.6vw] max-lg:px-[3vw] max-lg:py-[3vw] max-md:px-[5vw] max-md:py-[5vw]"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-[4.4vh] aspect-square items-center justify-center rounded-md bg-[#aeb8e8]/15 text-[#aeb8e8]">
                  <Icon name="flow" className="h-1/2 w-1/2" />
                </span>
                <div className="flex flex-col">
                  <span className="text-24 font-medium">{automation.runTitle}</span>
                  <span className="text-14 text-vey-dim">
                    Step <span data-run-count>0</span> of {automation.steps.length}
                  </span>
                </div>
              </div>
              <span className="grid rounded-md border border-white/10 px-[0.8vw] py-[0.3vw] text-14 max-lg:px-[1.6vw] max-lg:py-[0.6vw] max-md:px-[3vw] max-md:py-[1vw]">
                <span data-run-label className="col-start-1 row-start-1 text-vey-dim">
                  Running
                </span>
                <span data-run-label className="col-start-1 row-start-1 text-vey-lilac">
                  Completed
                </span>
              </span>
            </div>
            <span className="block h-0.5 w-full overflow-hidden rounded-md bg-white/10">
              <span data-run-bar className="block h-full w-full origin-left bg-[#aeb8e8] [transform:scaleX(0)]" />
            </span>
            <ol className="flex flex-col">
              {automation.steps.map((step, i) => (
                <li key={step.title} data-auto-step className="flex gap-4">
                  <div className="relative flex flex-col items-center">
                    <span
                      data-step-ring
                      className="relative flex h-[4vh] aspect-square items-center justify-center rounded-md border border-white/15 max-lg:h-[3.2vh] max-md:h-[4.4vh]"
                    >
                      <span data-step-num className="font-vey-mono text-14 text-vey-dim">
                        {i + 1}
                      </span>
                      <span
                        data-step-fill
                        className="absolute inset-0 flex items-center justify-center rounded-md bg-[#aeb8e8] text-[#0b1020] [transform:scale(0)]"
                      >
                        <svg
                          data-check
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.4}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden
                          className="h-1/2 w-1/2"
                        >
                          <path d="M5 12.5 10 17l9-10" pathLength={1} strokeDasharray="1" />
                        </svg>
                      </span>
                    </span>
                    {i < automation.steps.length - 1 ? (
                      <span aria-hidden className="block w-px flex-1 bg-white/10">
                        <span data-step-conn className="block h-full w-px origin-top bg-[#aeb8e8]" />
                      </span>
                    ) : null}
                  </div>
                  <div className="flex flex-1 items-start justify-between gap-4">
                    <div className="flex flex-col gap-1 py-[0.6vw] max-lg:py-[1vw] max-md:py-[2vw]">
                      <span className="text-24">{step.title}</span>
                      <span className="text-14 text-vey-dim">{step.meta}</span>
                    </div>
                    <span className="grid text-14">
                      {STATUS.map((s) => (
                        <span
                          key={s}
                          data-status-label
                          className={`col-start-1 row-start-1 text-right ${s === "Done" ? "text-vey-lilac" : "text-vey-dim"}`}
                        >
                          {s}
                        </span>
                      ))}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div
            data-summary
            className="flex gap-4 rounded-md border border-[#aeb8e8]/30 bg-[#aeb8e8]/10 px-[1.4vw] py-[1.2vw] max-lg:px-[3vw] max-lg:py-[2.4vw] max-md:px-[5vw] max-md:py-[5vw]"
          >
            <span className="flex h-[4.4vh] aspect-square shrink-0 items-center justify-center rounded-md bg-[#aeb8e8] text-[#0b1020]">
              <Icon name="doc" className="h-1/2 w-1/2" />
            </span>
            <div className="flex flex-col gap-1">
              <span className="text-24 font-medium">{automation.summary.title}</span>
              <p className="text-22 text-vey-dim">
                <TypingText text={automation.summary.body} mode="words" wordsPerSecond={18} />
              </p>
            </div>
          </div>
        </div>
      </div>
    </Scene>
  );
};

export default Automation;
