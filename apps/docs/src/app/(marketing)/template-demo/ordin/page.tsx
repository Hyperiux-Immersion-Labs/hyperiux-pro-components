// Built using Hyperiux Vault: https://vault.hyperiux.com
import "./ordin-styles.css";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Geist } from "next/font/google";
import Header from "./components/Header";
import Hero from "./components/Hero";
import SignalOrb from "./components/SignalOrb";
import LenisSmoothScroll from "./components/LenisSmoothScroll";
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
const Footer = dynamic(() => import("./components/Footer"));

const bodyFont = Geist({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-ord-body",
  display: "swap",
});

const title = "Ordin - AI Agent Platform SaaS Template";
const description =
  "A monochrome, scroll-driven landing template for AI and SaaS products: one prompt travels the whole page, from tokens to an agent swarm, through guardrails and into a finished run.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "https://vault.hyperiux.com/templates/ordin" },
  openGraph: { title, description },
  twitter: { card: "summary_large_image", title, description },
};

const page = () => {
  return (
    <div className={`ord-page relative overflow-x-clip ${bodyFont.variable}`}>
      <LenisSmoothScroll />
      <div aria-hidden className="ord-noise pointer-events-none fixed inset-0 z-40" />
      <Header />
      <noscript>
        <style>{"[data-ord-loader]{display:none!important}.ord-page [data-ord-hide]{visibility:visible!important}"}</style>
      </noscript>
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
      <Footer />
    </div>
  );
};

export default page;
