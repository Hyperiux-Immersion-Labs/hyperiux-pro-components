// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef } from "react";
import Spotlight from "./Animations/Spotlight";
import BeamFrame from "./Animations/BeamFrame";
import LineReveal from "./Animations/LineReveal";
import { useReveal } from "./Animations/useReveal";
import { OrdButton } from "./Buttons";
import { ENQUIRE } from "./nav";
import Icon, { type IconName } from "./Icon";
import AnimatedTabs from "./effects/animated-tabs";
import Roll from "./Animations/Roll";
import { THEME } from "../theme";

type Plan = {
  icon: IconName;
  name: string;
  monthly: string;
  annual: string;
  unit: string;
  blurb: string;
  features: string[];
  cta: string;
  featured?: boolean;
};

const PLANS: Plan[] = [
  {
    icon: "box",
    name: "Starter",
    monthly: "0",
    annual: "0",
    unit: "free forever",
    blurb: "For one builder shipping a first agent.",
    features: ["10,000 runs a month", "3 agents per job", "Community support", "7-day trace history"],
    cta: "Start free",
  },
  {
    icon: "layers",
    name: "Scale",
    monthly: "49",
    annual: "39",
    unit: "per seat / month",
    blurb: "For teams running agents in production.",
    features: ["500,000 runs a month", "Unlimited agents", "Policies and sign-off queues", "90-day replays", "SSO and audit export"],
    cta: "Start a trial",
    featured: true,
  },
  {
    icon: "building",
    name: "Enterprise",
    monthly: "Custom",
    annual: "Custom",
    unit: "volume pricing",
    blurb: "For regulated work and private deployments.",
    features: ["Dedicated regions", "Bring your own model", "Private VPC runtime", "24/7 named engineer"],
    cta: "Talk to sales",
  },
];

const LINE = "border-(--ord-ink)/12";

const PlanCard = ({ plan, annual }: { plan: Plan; annual: boolean }) => {
  const price = annual ? plan.annual : plan.monthly;
  const card = (
    <Spotlight
      tone="light"
      className={`ord-draw relative flex h-full flex-col gap-8 border px-[1.8vw] py-[1.8vw] max-lg:px-[4vw] max-lg:py-[4vw] max-md:px-[5vw] max-md:py-[6vw] ${
        plan.featured ? "border-transparent bg-[color-mix(in_srgb,var(--ord-primary)_18%,var(--ord-paper))]" : `${LINE} bg-white/45`
      }`}
    >
      <div className="relative flex items-start justify-between gap-4">
        <Icon
          name={plan.icon}
          className="h-[3vh] aspect-square text-ord-primary-deep max-lg:h-[2.2vh] max-md:h-[3.2vh]"
        />
        {plan.featured && (
          <span className="bg-ord-ink px-[0.6vw] py-[0.3vw] ord-label text-14 uppercase text-(--ord-primary-light) max-lg:px-[1.2vw] max-lg:py-[0.6vw] max-md:px-[2.4vw] max-md:py-[1vw]">
            Most teams
          </span>
        )}
      </div>
      <div className="relative flex flex-col gap-1">
        <h3 className="text-30">{plan.name}</h3>
        <p className="text-22 text-(--ord-text-muted)">{plan.blurb}</p>
      </div>
      <div className="relative flex items-end gap-3">
        <p className="text-64 leading-none">
          {/* Switching tabs mounts the other grid, so each price rolls over from the other billing period */}
          {price === "Custom" ? price : <Roll value={`$${price}`} from={`$${annual ? plan.monthly : plan.annual}`} />}
        </p>
        <span className="ord-label text-14 uppercase text-(--ord-text-muted)">{plan.unit}</span>
      </div>
      <ul className={`relative flex flex-1 flex-col gap-3 border-t ${LINE} pt-[1.4vw] max-lg:pt-[3vw] max-md:pt-[5vw]`}>
        {plan.features.map((f) => (
          <li key={f} className="flex items-center gap-3 text-22">
            <Icon name="check" className="h-[1.8vh] aspect-square shrink-0 text-ord-primary-deep max-lg:h-[1.4vh] max-md:h-[2vh]" />
            {f}
          </li>
        ))}
      </ul>
      <div className="relative">
        <OrdButton href={ENQUIRE.sales} variant={plan.featured ? "ink" : "inkLine"} className="w-full justify-between">
          {plan.cta}
        </OrdButton>
      </div>
    </Spotlight>
  );

  return plan.featured ? <BeamFrame className="h-full bg-(--ord-ink)/12">{card}</BeamFrame> : card;
};

const Grid = ({ annual }: { annual: boolean }) => (
  <div className="grid grid-cols-3 gap-4 max-lg:mx-auto max-lg:w-[70%] max-lg:grid-cols-1 max-md:w-full">
    {PLANS.map((p) => (
      <PlanCard key={p.name} plan={p} annual={annual} />
    ))}
  </div>
);

const Pricing = () => {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  return (
    <section ref={root} id="pricing" data-ord-orb="pricing" data-ord-light className="relative bg-(--ord-paper) text-ord-ink">
      <div className="flex flex-col items-center gap-12 ord-container ord-section max-md:gap-8">
        <LineReveal className="text-center">
          <h2>
            Priced per run. <span className="text-(--ord-text-muted)">Not per prompt.</span>
          </h2>
        </LineReveal>
        <div data-ord-reveal className="w-full">
          <AnimatedTabs
            tabs={[
              { id: "monthly", label: "Monthly", content: <Grid annual={false} /> },
              { id: "annual", label: "Annual, save 20%", content: <Grid annual /> },
            ]}
            indicator="glide"
            pillStyle="solid"
            accentColor={THEME.ink}
            rounded="xs"
            listBorder
            divider={false}
            hoverHighlight
            // The cards hold still on a switch; only the prices roll
            animationType="none"
            className="text-22 text-ord-ink [&>div:first-child]:items-center"
          />
        </div>
      </div>
    </section>
  );
};

export default Pricing;
