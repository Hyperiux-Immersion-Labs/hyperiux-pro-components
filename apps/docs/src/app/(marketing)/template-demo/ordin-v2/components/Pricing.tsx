// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { pricing } from "../content";
import { prefersReducedMotion } from "./Animations/reducedMotion";
import { fade, lines, ready, scene } from "./Animations/scroll";
import Button from "./Button";
import Icon from "./Icon";

gsap.registerPlugin(useGSAP);

type Billing = "monthly" | "yearly";

const Pricing = () => {
  const root = useRef<HTMLElement>(null);
  const [billing, setBilling] = useState<Billing>("monthly");

  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        ready(root.current);
        return;
      }

      const tl = scene(root.current, "top 75%", "center 55%");
      const split = lines(tl, root.current?.querySelector("h2") ?? null, 0);
      fade(tl, "[data-orn-toggle]", 0.3, 0, 12);
      fade(tl, "[data-orn-plan]", 0.5, 0.15, 32);

      return () => split?.revert();
    },
    { scope: root },
  );

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo("[data-orn-price]", { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.25, ease: "power2.out", stagger: 0.04 });
    },
    { scope: root, dependencies: [billing] },
  );

  return (
    <section ref={root} id="pricing" data-orn-tone="light" className="orn-light relative z-[1] bg-orn-light">
      <div className="orn-container orn-section flex flex-col items-center gap-10 max-md:gap-8">
        <h2 data-orn-split className="text-center">
          {pricing.title[0]} {pricing.title[1]}
        </h2>
        <div data-orn-toggle data-orn-fade role="group" aria-label="Billing period" className="flex border border-orn-line bg-[color-mix(in_srgb,white_50%,transparent)] px-1 py-1">
          {(["monthly", "yearly"] as Billing[]).map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={billing === key}
              onClick={() => setBilling(key)}
              className="flex h-[4.2vh] items-center gap-2 px-[1.2vw] text-14 transition-colors duration-200 aria-pressed:bg-[var(--orn-forest)] aria-pressed:text-[var(--orn-text-on-dark)] max-lg:h-[3.2vh] max-lg:px-[2.4vw] max-md:h-[4.8vh] max-md:px-[4vw]"
            >
              {pricing.billing[key]}
              {key === "yearly" && <span className="font-orn-mono text-12 text-orn-accent">{pricing.billing.yearlyNote}</span>}
            </button>
          ))}
        </div>
        <div className="grid w-full grid-cols-3 gap-4 max-lg:grid-cols-1 max-lg:w-[70%] max-md:w-full">
          {pricing.plans.map((plan) => (
            <article
              key={plan.name}
              data-orn-plan
              data-orn-fade
              className={`relative flex flex-col gap-8 border px-[1.8vw] py-[1.8vw] max-lg:px-[4vw] max-lg:py-[4vw] max-md:px-[5vw] max-md:py-[6vw] ${
                plan.featured
                  ? "border-[var(--orn-accent)] bg-[color-mix(in_srgb,var(--orn-mint)_28%,var(--orn-light-alt))]"
                  : "border-orn-line bg-[color-mix(in_srgb,white_45%,transparent)]"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <Icon name={plan.icon} className="h-[3vh] aspect-square text-orn-accent max-lg:h-[2.2vh] max-md:h-[3.2vh]" />
                {plan.badge && (
                  <span className="bg-[var(--orn-forest)] px-[0.6vw] py-[0.3vw] font-orn-mono text-12 text-[var(--orn-mint)] max-lg:px-[1.2vw] max-lg:py-[0.6vw] max-md:px-[2.4vw] max-md:py-[1vw]">
                    {plan.badge}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-19">{plan.name}</h3>
                <p className="text-14 text-orn-muted">{plan.tagline}</p>
              </div>
              <div className="flex h-[7vh] items-end gap-2 max-lg:h-[5vh] max-md:h-[7vh]">
                {plan.price ? (
                  <>
                    <span data-orn-price className="text-48 font-orn-display">
                      {pricing.currency}
                      {plan.price[billing]}
                    </span>
                    <span className="text-14 text-orn-muted">{pricing.period}</span>
                  </>
                ) : (
                  <span className="text-30 font-orn-display">{plan.priceLabel}</span>
                )}
              </div>
              <ul className="flex flex-1 flex-col gap-3 border-t border-orn-line py-[1.4vw] max-lg:py-[3vw] max-md:py-[5vw]">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-14">
                    <Icon name="check" className="h-[1.8vh] aspect-square shrink-0 text-orn-accent max-lg:h-[1.4vh] max-md:h-[2vh]" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button href={plan.cta.href} variant={plan.featured ? "solid" : "line"} block className={plan.featured ? "" : "text-orn-ink"}>
                {plan.cta.label}
              </Button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
