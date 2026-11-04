// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef } from "react";
import Scene from "./Scene";
import Lines from "./Animations/Lines";
import { useScene } from "./Animations/scene";
import TypingText, { syncTypingCues, type TypingCue } from "./effects/typing-text";
import { Icon } from "./Icons";
import { howItWorks } from "../content";

const CARD =
  "relative flex flex-col gap-4 rounded-md border border-white/10 bg-linear-to-b from-[#161f38] to-[#0b1020] px-[1.2vw] py-[1.2vw] max-lg:px-[2vw] max-lg:py-[2vw] max-md:px-[5vw] max-md:py-[5vw]";

const HowItWorks = () => {
  const ref = useRef<HTMLElement>(null);
  const cues = useRef<TypingCue[]>([]);

  useScene(
    ref,
    (tl, { q, mobile }) => {
      const cards = q("[data-step]");
      const track = q("[data-track]")[0] as HTMLElement | undefined;
      tl.fromTo(cards, { autoAlpha: 0, y: 30 }, { autoAlpha: 0.4, y: 0, duration: 1, stagger: 0.1, ease: "power2.out" }, 0.4);
      if (!mobile && track) {
        tl.fromTo(q("[data-track-fill]"), { scaleX: 0 }, { scaleX: 1, duration: 5.4, ease: "none" }, 1.4);
        tl.fromTo(
          q("[data-packet]"),
          { x: 0, autoAlpha: 0 },
          { x: () => track.offsetWidth, autoAlpha: 1, duration: 5.4, ease: "none" },
          1.4,
        );
      }
      cards.forEach((card, i) => {
        const at = 1.4 + i * 1.8;
        tl.to(card, { autoAlpha: 1, borderColor: "rgba(174,184,232,0.55)", duration: 0.5 }, at);
        tl.fromTo(
          card.querySelector("[data-step-dot]"),
          { backgroundColor: "rgba(174,184,232,0)" },
          { backgroundColor: "#aeb8e8", duration: 0.3 },
          at,
        );
        tl.fromTo(
          card.querySelectorAll("[data-step-item]"),
          { autoAlpha: 0, y: 10 },
          { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.2 },
          at + 0.2,
        );
        const bar = card.querySelector("[data-step-bar]");
        if (bar) tl.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: "power1.inOut" }, at + 0.3);
        const checks = card.querySelectorAll("[data-check] path");
        if (checks.length) tl.fromTo(checks, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.4, stagger: 0.3 }, at + 0.4);
        if (i < cards.length - 1) tl.to(card, { borderColor: "rgba(255,255,255,0.1)", duration: 0.5 }, at + 1.8);
      });
      tl.fromTo(q("[data-done]"), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 8);
      tl.to({}, { duration: 1 });
      const total = tl.duration();
      cues.current = [
        { at: 1.7 / total, el: q("[data-type-input] [data-typing]")[0] },
        { at: 5.1 / total, el: q("[data-type-decide] [data-typing]")[0] },
      ];
    },
    { onUpdate: (p) => syncTypingCues(cues.current, p) },
  );

  const [input, analyse, decide, execute] = howItWorks.steps;

  return (
    <Scene sectionRef={ref} id="how-it-works" chapter={8} innerClassName="justify-center">
      <div className="flex flex-col gap-14 vey-container max-md:gap-10 max-md:py-[16vw]">
        <Lines id="how-it-works-title" lines={howItWorks.heading} className="w-[60%] max-lg:w-[90%] max-md:w-full" />

        <div className="relative">
          <div data-track aria-hidden className="absolute left-[12.5%] right-[12.5%] top-[3.4vh] h-px bg-white/10 max-lg:hidden">
            <span data-track-fill className="block h-px w-full origin-left bg-[#aeb8e8]" />
            <span data-packet className="absolute left-0 top-0 block h-0 w-0">
              <span className="absolute left-0 top-0 block h-[1.2vh] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f5f6fa] shadow-[0_0_12px_rgba(174,184,232,0.9)]" />
            </span>
          </div>

          <ol className="relative grid grid-cols-4 gap-6 max-lg:grid-cols-2 max-lg:gap-4 max-md:grid-cols-1">
            {howItWorks.steps.map((step, i) => (
              <li key={step.label} data-step className={CARD}>
                <div className="flex items-center justify-between">
                  <span className="font-vey-mono text-14 uppercase text-vey-lilac">
                    0{i + 1} {step.label}
                  </span>
                  <span data-step-dot className="block h-[1vh] aspect-square rounded-full border border-[#aeb8e8]" />
                </div>
                <h3 className="text-30">{step.title}</h3>

                {i === 0 ? (
                  <div
                    data-step-item
                    className="flex gap-3 rounded-md border border-white/10 bg-white/[0.03] px-[0.8vw] py-[0.8vw] max-lg:px-[1.4vw] max-lg:py-[1.4vw] max-md:px-[4vw] max-md:py-[4vw]"
                  >
                    <span className="flex h-[3.6vh] aspect-square shrink-0 items-center justify-center rounded-md bg-[#202b4a] text-14">
                      LM
                    </span>
                    <p data-type-input className="text-22 text-vey-dim">
                      <TypingText text={input.body} charactersPerSecond={42} />
                    </p>
                  </div>
                ) : null}

                {i === 1 ? (
                  <>
                    <div className="flex flex-wrap gap-2">
                      {analyse.chips?.map((chip) => (
                        <span
                          key={chip}
                          data-step-item
                          className="rounded-md border border-white/10 px-[0.7vw] py-[0.3vw] text-14 text-vey-dim max-lg:px-[1.4vw] max-lg:py-[0.6vw] max-md:px-[3vw] max-md:py-[1vw]"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                    <p data-step-item className="text-22 text-vey-dim">
                      {analyse.body}
                    </p>
                    <span className="block h-0.5 w-full overflow-hidden rounded-md bg-white/10">
                      <span data-step-bar className="block h-full w-full origin-left bg-[#aeb8e8]" />
                    </span>
                  </>
                ) : null}

                {i === 2 ? (
                  <>
                    <p data-step-item data-type-decide className="text-22 text-[#e8eaf5]">
                      <TypingText text={decide.body} mode="words" wordsPerSecond={16} showCursor={false} />
                    </p>
                    <div data-step-item className="flex flex-col gap-2">
                      <div className="flex justify-between text-14 text-vey-dim">
                        <span>Confidence</span>
                        <span>High</span>
                      </div>
                      <span className="block h-0.5 w-full overflow-hidden rounded-md bg-white/10">
                        <span data-step-bar className="block h-full w-[86%] origin-left bg-[#aeb8e8]" />
                      </span>
                    </div>
                  </>
                ) : null}

                {i === 3 ? (
                  <ul className="flex flex-col gap-3">
                    {execute.actions?.map((a) => (
                      <li key={a} data-step-item className="flex items-center gap-3 text-22">
                        <span className="flex h-[2.6vh] aspect-square items-center justify-center rounded-full border border-[#aeb8e8]/50 text-[#aeb8e8]">
                          <svg
                            data-check
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden
                            className="h-[60%] w-[60%]"
                          >
                            <path d="M5 12.5 10 17l9-10" pathLength={1} strokeDasharray="1" />
                          </svg>
                        </span>
                        {a}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ol>
        </div>

        <div
          data-done
          className="flex items-center gap-3 self-start rounded-md border border-[#aeb8e8]/30 bg-[#aeb8e8]/10 px-[1.2vw] py-[0.6vw] text-22 max-lg:px-[2.4vw] max-lg:py-[1.2vw] max-md:px-[4vw] max-md:py-[2.4vw]"
        >
          <Icon
            name="check"
            className="h-[1vw] w-[1vw] text-[#aeb8e8] max-lg:h-[2vw] max-lg:w-[2vw] max-md:h-[4vw] max-md:w-[4vw]"
            strokeWidth={2}
          />
          {howItWorks.done}
        </div>
      </div>
    </Scene>
  );
};

export default HowItWorks;
