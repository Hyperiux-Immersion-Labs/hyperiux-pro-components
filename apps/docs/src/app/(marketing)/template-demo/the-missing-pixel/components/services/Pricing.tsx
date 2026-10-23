// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { FadeUp, RuleDraw } from "../Animations/gsapAnim";
import SectionHead from "../shared/SectionHead";
import Tilt from "../Animations/Tilt";
import { prefersReducedMotion } from "../Animations/reducedMotion";
import PixelButton from "../Buttons/PixelButton";
import { Check } from "../Buttons/icons";
import { ROUTES } from "../../routes";

gsap.registerPlugin(useGSAP);

type Plan = "project" | "retainer";

const PLANS: { value: Plan; label: string }[] = [
  { value: "project", label: "Per project" },
  { value: "retainer", label: "Monthly retainer" },
];

const Pricing = () => {
  const [plan, setPlan] = useState<Plan>("project");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const thumbRef = useRef<HTMLSpanElement | null>(null);
  const readyRef = useRef(false);

  useGSAP(
    () => {
      const duration = readyRef.current && !prefersReducedMotion() ? 0.5 : 0;
      gsap.to(thumbRef.current, {
        xPercent: plan === "project" ? 0 : 100,
        duration,
        ease: "power3.out",
      });
      const incoming = plan === "project" ? 0 : 1;
      gsap.utils.toArray<HTMLElement>("[data-roll]").forEach((roll, index) => {
        const [first, second] = Array.from(roll.children) as HTMLElement[];
        const [next, previous] = incoming === 0 ? [first, second] : [second, first];
        const delay = duration ? index * 0.05 : 0;
        if (!duration) {
          gsap.set(next, { yPercent: 0 });
          gsap.set(previous, { yPercent: 110 });
          return;
        }
        gsap.fromTo(
          next,
          { yPercent: 110 },
          { yPercent: 0, duration: 0.7, delay, ease: "power3.out" },
        );
        gsap.to(previous, { yPercent: -110, duration: 0.7, delay, ease: "power3.out" });
      });
      readyRef.current = true;
    },
    { dependencies: [plan], scope: rootRef },
  );

  return (
    <div ref={rootRef} className="flex flex-col gap-14 max-lg:gap-11">
      <SectionHead
        stacked
        title="Pricing"
        text="Published, fixed, agreed before we start. Pay per project or spread it over a retainer."
        textClassName="w-[50%]"
      >
        <div
          role="group"
          aria-label="Billing model"
          className="inline-flex rounded-full bg-mpx-surface p-1"
        >
          <div className="relative grid grid-cols-2">
            <span
              ref={thumbRef}
              aria-hidden
              className="absolute inset-y-0 left-0 w-1/2 rounded-full bg-(--mpx-ink)"
            />
            {PLANS.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={plan === option.value}
                onClick={() => setPlan(option.value)}
                className={`relative h-[5.6vh] whitespace-nowrap px-[1.4vw] text-22 transition-colors duration-300 max-lg:h-[4.6vh] max-lg:px-[3vw] max-md:h-[6.4vh] max-md:px-[5vw] ${
                  plan === option.value ? "text-(color:--mpx-paper)" : "text-(color:--mpx-ink)"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </SectionHead>

      <ul className="grid grid-cols-3 gap-9 max-lg:grid-cols-1 max-lg:gap-6">
        {TIERS.map((tier, index) => (
          <FadeUp as="li" key={tier.name} delay={index * 0.1} className="flex">
            <Tilt
              className={`flex w-full flex-col justify-between gap-9 rounded-lg border px-[2.2vw] py-[2.2vw] max-lg:px-[5vw] max-lg:py-[5vw] max-md:px-[6vw] max-md:py-[7vw] ${
                tier.featured
                  ? "border-transparent bg-(--mpx-ink) text-(color:--mpx-paper)"
                  : "border-(--mpx-ink)/10 bg-(--mpx-white)"
              }`}
            >
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-30">{tier.name}</h3>
                  {tier.featured && (
                    <span className="inline-flex h-[3.2vh] items-center rounded-full bg-(--mpx-accent) px-[0.9vw] text-14 text-(color:--mpx-ink) max-lg:h-[2.8vh] max-lg:px-[1.8vw] max-md:h-[4.1vh] max-md:px-[3.5vw]">
                      Most chosen
                    </span>
                  )}
                </div>
                <p
                  className={`text-24 ${tier.featured ? "text-(color:--mpx-white)/60" : "text-mpx-muted"}`}
                >
                  {tier.text}
                </p>
                <p className="flex flex-col gap-2">
                  <RollText
                    className="font-mpx-head text-64 leading-none tracking-tight"
                    plan={plan}
                    values={[tier.project.price, tier.retainer.price]}
                  />
                  <RollText
                    className={`text-14 ${tier.featured ? "text-(color:--mpx-white)/60" : "text-mpx-muted"}`}
                    plan={plan}
                    values={[tier.project.unit, tier.retainer.unit]}
                  />
                </p>
                <ul className="flex flex-col gap-3">
                  {tier.features.map((feature, featureIndex) => (
                    <FadeUp
                      as="li"
                      key={feature}
                      delay={0.3 + featureIndex * 0.08}
                      className="flex items-start gap-3 text-24"
                    >
                      <Check className="size-[1.2vw] shrink-0 text-mpx-accent max-lg:size-[2.2vw] max-md:size-[4.6vw]" />
                      {feature}
                    </FadeUp>
                  ))}
                </ul>
              </div>
              <div>
                <PixelButton
                  label={`Choose ${tier.name}`}
                  href={ROUTES.contact}
                  variant={tier.featured ? "primary" : "outline"}
                  tone={tier.featured ? "dark" : "light"}
                  size="sm"
                  icon
                />
              </div>
            </Tilt>
          </FadeUp>
        ))}
      </ul>

      <div className="flex flex-col gap-6">
        <FadeUp>
          <h3 className="text-30">Add-ons</h3>
        </FadeUp>
        <ul className="flex flex-col">
          {ADDONS.map((addon, index) => (
            <li key={addon.name} className="relative">
              <RuleDraw syncWithFade className="absolute inset-x-0 top-0 h-px bg-(--mpx-ink)/10" />
              {index === ADDONS.length - 1 && (
                <RuleDraw syncWithFade className="absolute inset-x-0 bottom-0 h-px bg-(--mpx-ink)/10" />
              )}
              <FadeUp className="flex items-start justify-between gap-9 py-[1.4vw] max-lg:py-[2.6vw] max-md:flex-col max-md:gap-2 max-md:py-[5vw]">
              <span className="font-mpx-head w-[22%] text-28 font-medium max-md:w-full">
                {addon.name}
              </span>
              <span className="w-[48%] text-28 text-mpx-muted max-md:w-full">
                {addon.text}
              </span>
              <span className="w-[16%] text-right text-28 max-md:w-full max-md:text-left">
                {addon.price}
              </span>
              </FadeUp>
            </li>
          ))}
        </ul>
        <FadeUp>
          <p className="text-14 text-mpx-muted">
            Prices exclude VAT and local taxes. 40% to start, 30% at concept
            approval, 30% on delivery.
          </p>
        </FadeUp>
      </div>
    </div>
  );
};

const RollText = ({
  values,
  plan,
  className,
}: {
  values: [string, string];
  plan: Plan;
  className: string;
}) => (
  <span data-roll className="grid overflow-hidden py-1">
    {values.map((value, index) => (
      <span
        key={index}
        aria-hidden={(plan === "project") !== (index === 0)}
        className={`col-start-1 row-start-1 ${className}`}
      >
        {value}
      </span>
    ))}
  </span>
);

export default Pricing;

const TIERS = [
  {
    name: "Essentials",
    text: "For early-stage brands that need a strong core.",
    featured: false,
    project: { price: "$18k", unit: "per project, 8 to 12 weeks" },
    retainer: { price: "$6.5k", unit: "per month, 3 month minimum" },
    features: [
      "Positioning workshop",
      "Logo and wordmark",
      "Colour and typography",
      "Core guidelines (PDF)",
      "Social templates",
    ],
  },
  {
    name: "Complete",
    text: "For growing companies that need a system to scale with.",
    featured: true,
    project: { price: "$34k", unit: "per project, 8 to 12 weeks" },
    retainer: { price: "$11k", unit: "per month, 3 month minimum" },
    features: [
      "Everything in Essentials",
      "Customer research and audit",
      "Three creative routes",
      "Graphic system and icons",
      "Online guidelines",
      "Animated logo",
      "Two weeks of launch support",
    ],
  },
  {
    name: "Flagship",
    text: "For established brands rebranding across markets.",
    featured: false,
    project: { price: "$60k+", unit: "per project, 8 to 12 weeks" },
    retainer: { price: "$18k", unit: "per month, 3 month minimum" },
    features: [
      "Everything in Complete",
      "Naming or name review",
      "Testing in four markets",
      "Packaging or signage pilot",
      "Brand film direction",
      "Team training",
      "Quarterly brand check-ups",
    ],
  },
];

const ADDONS = [
  {
    name: "Naming",
    text: "Up to three shortlisted names, trademark-screened in your markets",
    price: "$6,000",
  },
  {
    name: "Motion identity",
    text: "Animated logo, transitions and a motion guide",
    price: "$7,500",
  },
  {
    name: "Brand website",
    text: "A five to eight page marketing site, Webflow or custom",
    price: "From $22,000",
  },
  {
    name: "Packaging range",
    text: "Structure and graphics for up to six products",
    price: "From $14,000",
  },
];
