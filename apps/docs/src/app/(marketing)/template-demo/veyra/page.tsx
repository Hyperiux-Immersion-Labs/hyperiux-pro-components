// Built using Hyperiux Vault: https://vault.hyperiux.com
import "./veyra-styles.css";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "./components/Header";
import Hero from "./components/Hero";
import StoryRail from "./components/StoryRail";
import LenisSmoothScroll from "./components/LenisSmoothScroll";

const PromiseSection = dynamic(() => import("./components/Promise"));
const Connected = dynamic(() => import("./components/Connected"));
const ContextAction = dynamic(() => import("./components/ContextAction"));
const Engine = dynamic(() => import("./components/Engine"));
const Pillars = dynamic(() => import("./components/Pillars"));
const Architecture = dynamic(() => import("./components/Architecture"));
const Integrations = dynamic(() => import("./components/Integrations"));
const HowItWorks = dynamic(() => import("./components/HowItWorks"));
const Automation = dynamic(() => import("./components/Automation"));
const Outcome = dynamic(() => import("./components/Outcome"));
const Platform = dynamic(() => import("./components/Platform"));
const Features = dynamic(() => import("./components/Features"));
const Dashboard = dynamic(() => import("./components/Dashboard"));
const Teams = dynamic(() => import("./components/Teams"));
const Proof = dynamic(() => import("./components/Proof"));
const Testimonials = dynamic(() => import("./components/Testimonials"));
const Pricing = dynamic(() => import("./components/Pricing"));
const Faq = dynamic(() => import("./components/Faq"));
const Cta = dynamic(() => import("./components/Cta"));
const Footer = dynamic(() => import("./components/Footer"));

const bodyFont = Geist({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-vey-body",
  display: "swap",
});

const monoFont = Geist_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-vey-mono",
  display: "swap",
});

const title = "Veyra - AI Platform SaaS Template";
const description =
  "A scroll-driven AI and SaaS website template: one flowing line connects particles, workflows, agents and integrations, then opens into a clean product site with a live dashboard, team tabs and pricing.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "https://vault.hyperiux.com/templates/veyra" },
  openGraph: { title, description },
  twitter: { card: "summary_large_image", title, description },
};

const page = () => {
  return (
    <div className={`vey-page relative overflow-x-clip ${bodyFont.variable} ${monoFont.variable}`}>
      <noscript>
        <style>
          {
            ".vey-page .vey-pre{opacity:1!important}.vey-page .vey-intro{display:none!important}.vey-page [data-line]{transform:none!important}.vey-page [data-desc]{opacity:1!important;visibility:visible!important}"
          }
        </style>
      </noscript>
      <LenisSmoothScroll />
      <Header />
      <StoryRail />
      <main id="vey-main" className="relative">
        <Hero />
        <PromiseSection />
        <Connected />
        <ContextAction />
        <Engine />
        <Pillars />
        <Architecture />
        <Integrations />
        <HowItWorks />
        <Automation />
        <Outcome />
        <Platform />
        <Features />
        <Dashboard />
        <Teams />
        <Proof />
        <Testimonials />
        <Pricing />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </div>
  );
};

export default page;
