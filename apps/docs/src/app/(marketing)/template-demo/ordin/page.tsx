// Built using Hyperiux Vault: https://vault.hyperiux.com
import dynamic from "next/dynamic";
import { pageMetadata } from "./metadata";
import Hero from "./components/Hero";
import SignalOrb from "./components/SignalOrb";
import IntroLoader from "./components/IntroLoader";
import HeroBackdrop from "./components/HeroBackdrop";

const Tokens = dynamic(() => import("./components/Tokens"));
const Swarm = dynamic(() => import("./components/Swarm"));
const Guardrails = dynamic(() => import("./components/Guardrails"));
const Stack = dynamic(() => import("./components/Stack"));
const Statement = dynamic(() => import("./components/Statement"));
const Metrics = dynamic(() => import("./components/Metrics"));
const Pricing = dynamic(() => import("./components/Pricing"));
const Social = dynamic(() => import("./components/Social"));
const Faq = dynamic(() => import("./components/Faq"));
const Cta = dynamic(() => import("./components/Cta"));

export const metadata = pageMetadata(
  "Ordin - AI Agent Platform SaaS Template",
  "A scroll-driven landing template for AI and SaaS products: one prompt travels the whole page, from tokens to an agent swarm, through guardrails and into a finished run.",
);

const page = () => {
  return (
    <main className="relative z-2 bg-ord-ink [clip-path:inset(0)]">
      <div aria-hidden className="ord-glow pointer-events-none fixed inset-0 z-0" />
      <IntroLoader />
      <HeroBackdrop />
      <SignalOrb />
      <Hero />
      <Tokens />
      <Swarm />
      <Guardrails />
      <Stack />
      <Statement />
      <Metrics />
      <Pricing />
      <Social />
      <Faq />
      <Cta />
    </main>
  );
};

export default page;
