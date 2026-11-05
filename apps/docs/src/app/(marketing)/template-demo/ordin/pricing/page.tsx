// Built using Hyperiux Vault: https://vault.hyperiux.com
import { pageMetadata } from "../metadata";
import { ENQUIRE } from "../components/nav";
import PageReady from "../components/Animations/PageReady";
import { CtaOrb } from "../components/SignalOrb";
import PageHero from "../components/pages/PageHero";
import UsageMeter from "../components/pages/UsageMeter";
import CompareTable from "../components/pages/CompareTable";
import CostEstimator from "../components/pages/CostEstimator";
import Pricing from "../components/Pricing";
import Faq from "../components/Faq";
import Cta from "../components/Cta";

export const metadata = pageMetadata(
  "Pricing | Ordin",
  "Priced per finished run, not per prompt. Start free, scale with your team, or talk to us about a private deployment.",
  "/pricing",
);

const page = () => {
  return (
    <main className="relative z-2 bg-ord-ink [clip-path:inset(0)]">
      <PageReady />
      <div aria-hidden className="ord-glow pointer-events-none fixed inset-0 z-0" />
      <CtaOrb />
      <PageHero
        orb="pricing-hero"
        chapter="Pricing"
        title={
          <>
            Pay for <span className="text-ord-primary-light">finished work.</span>
          </>
        }
        copy="A run is one instruction carried through to a finished result, however many agents it takes. That is the only thing we charge for."
        primary={{ label: "Start free", href: "#pricing" }}
        secondary={{ label: "Talk to sales", href: ENQUIRE.sales }}
        visual={<UsageMeter />}
        arc={{ speed: 0.8, flow: 0.8, softness: 1.6, intensity: 1.2 }}
      />
      <CostEstimator />
      <Pricing />
      <CompareTable />
      <Faq />
      <Cta />
    </main>
  );
};

export default page;
