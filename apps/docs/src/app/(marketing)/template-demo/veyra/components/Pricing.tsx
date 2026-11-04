// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Lines from "./Animations/Lines";
import { lineIn, useReveal } from "./Animations/scene";
import { prefersReducedMotion } from "./Animations/reducedMotion";
import { Icon } from "./Icons";
import { VeyButton } from "./Buttons";
import AnimatedSwitch from "./effects/animated-switch";
import BorderBeam from "./effects/border-beam";
import { pricing } from "../content";

function Featured({ on, children }: { on: boolean; children: ReactNode }) {
  if (!on) return <>{children}</>;
  return (
    <BorderBeam theme="dark" duration={7} beamWidth={1.5} className="h-full w-full">
      {children}
    </BorderBeam>
  );
}

const Pricing = () => {
  const ref = useRef<HTMLElement>(null);
  const [yearly, setYearly] = useState(false);

  useReveal(ref, (tl, { q, mobile }) => {
    lineIn(tl, q("[data-line]"), 0, 1);
    tl.fromTo(q("[data-desc], [data-cycle]"), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, stagger: 0.1 }, 0.2);
    q("[data-plan]").forEach((card, i) => {
      const featured = pricing.plans[i]?.featured;
      tl.fromTo(
        card,
        { autoAlpha: 0, y: mobile ? 40 : featured ? 40 : 80 },
        { autoAlpha: 1, y: 0, duration: 1.1 },
        mobile ? 0.4 + i * 0.1 : featured ? 0.35 : 0.5,
      );
    });
  });

  useGSAP(
    () => {
      ref.current?.querySelectorAll<HTMLElement>("[data-price]").forEach((el) => {
        const to = Number(yearly ? el.dataset.yearly : el.dataset.monthly);
        const from = Number(el.textContent) || 0;
        if (prefersReducedMotion() || from === to) {
          el.textContent = String(to);
          return;
        }
        const state = { v: from };
        gsap.to(state, { v: to, duration: 0.6, ease: "power2.out", onUpdate: () => void (el.textContent = String(Math.round(state.v))) });
      });
    },
    { dependencies: [yearly] },
  );

  return (
    <section ref={ref} id="pricing" aria-labelledby="pricing-title" data-vey-tone="light" className="relative bg-vey-paper text-vey-ink">
      <div className="flex flex-col items-center gap-14 vey-container vey-section max-md:gap-10">
        <div className="flex flex-col items-center gap-6 text-center">
          <Lines id="pricing-title" lines={pricing.heading} />
          <p data-desc className="text-28 text-vey-slate">
            {pricing.description}
          </p>
          <div data-cycle className="flex items-center gap-4 max-md:gap-3">
            <button
              type="button"
              tabIndex={-1}
              aria-hidden
              onClick={() => setYearly(false)}
              className={`text-22 transition-colors duration-300 ${yearly ? "text-[#73798a] hover:text-[#151927]" : "text-[#151927]"}`}
            >
              Monthly
            </button>
            <AnimatedSwitch checked={yearly} onCheckedChange={setYearly} aria-label="Bill yearly" onColor="#151927" offColor="#d5d9e6" />
            <button
              type="button"
              tabIndex={-1}
              aria-hidden
              onClick={() => setYearly(true)}
              className={`flex items-center gap-2 text-22 transition-colors duration-300 ${yearly ? "text-[#151927]" : "text-[#73798a] hover:text-[#151927]"}`}
            >
              Yearly
              <span
                className={`rounded-md px-[0.5vw] py-[0.1vw] text-14 transition-colors duration-300 max-lg:px-[1vw] max-lg:py-[0.2vw] max-md:px-[2vw] max-md:py-[0.4vw] ${yearly ? "bg-[#aeb8e8] text-[#0b1020]" : "bg-[#e8eaf5] text-[#202b4a]"}`}
              >
                {pricing.yearlyNote}
              </span>
            </button>
          </div>
        </div>

        <ul className="grid w-full grid-cols-3 items-stretch gap-5 max-lg:grid-cols-1 max-lg:w-[80%] max-md:w-full">
          {pricing.plans.map((plan) => {
            const dark = plan.featured;
            return (
              <li key={plan.name} data-plan className="flex">
                <Featured on={dark}>
                  <div
                    className={`relative flex h-full w-full flex-col gap-8 rounded-md px-[2vw] py-[2vw] max-lg:px-[4vw] max-lg:py-[4vw] max-md:px-[6vw] max-md:py-[7vw] ${
                      dark ? "bg-linear-to-b from-[#202b4a] to-[#151927] text-[#f5f6fa]" : "vey-card-light"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex flex-col gap-1">
                        <h3 className="text-30">{plan.name}</h3>
                        <span className={`text-22 ${dark ? "text-[#f5f6fa]/60" : "text-vey-slate"}`}>{plan.description}</span>
                      </div>
                      {plan.featured ? (
                        <span className="rounded-md bg-[#aeb8e8] px-[0.8vw] py-[0.3vw] text-14 font-medium text-[#0b1020] max-lg:px-[1.6vw] max-lg:py-[0.6vw] max-md:px-[3vw] max-md:py-[1vw]">
                          {pricing.featuredLabel}
                        </span>
                      ) : null}
                    </div>

                    <div className="flex items-baseline gap-2">
                      {plan.custom ? (
                        <span className="text-64 font-medium">{pricing.customLabel}</span>
                      ) : (
                        <>
                          <span className="text-64 font-medium tabular-nums">
                            $
                            <span data-price data-monthly={plan.monthly} data-yearly={plan.yearly}>
                              {plan.monthly}
                            </span>
                          </span>
                          <span className={`text-22 ${dark ? "text-[#f5f6fa]/60" : "text-vey-slate"}`}>{pricing.perMonth}</span>
                        </>
                      )}
                    </div>
                    <span className={`text-14 ${dark ? "text-[#f5f6fa]/60" : "text-vey-slate"}`} aria-live="polite">
                      {plan.custom ? "Tailored to your organisation" : yearly ? "Billed yearly" : "Billed monthly"}
                    </span>

                    <span className={`block h-px w-full ${dark ? "bg-white/10" : "bg-[#e2e4ec]"}`} />

                    <ul className="flex flex-1 flex-col gap-3">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-3 text-24">
                          <span
                            className={`flex h-[2.6vh] aspect-square shrink-0 items-center justify-center rounded-full ${dark ? "bg-[#aeb8e8] text-[#0b1020]" : "bg-[#e8eaf5] text-[#202b4a]"}`}
                          >
                            <Icon name="check" className="h-[60%] w-[60%]" strokeWidth={2.4} />
                          </span>
                          {f}
                        </li>
                      ))}
                    </ul>

                    <VeyButton href={plan.cta.href} variant={dark ? "primary" : "outline"} className="w-full">
                      {plan.cta.label}
                    </VeyButton>
                  </div>
                </Featured>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};

export default Pricing;
