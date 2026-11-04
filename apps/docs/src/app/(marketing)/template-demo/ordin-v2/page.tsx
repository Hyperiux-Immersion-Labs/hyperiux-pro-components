// Built using Hyperiux Vault: https://vault.hyperiux.com
import "./ordin-v2-styles.css";
import type { CSSProperties } from "react";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { IBM_Plex_Mono, Inter, Manrope } from "next/font/google";
import { theme } from "./content";
import AuroraLayer from "./components/AuroraLayer";
import Header from "./components/Header";
import Hero from "./components/Hero";
import LenisSmoothScroll from "./components/LenisSmoothScroll";

const Execution = dynamic(() => import("./components/Execution"));
const Specialists = dynamic(() => import("./components/Specialists"));
const Governance = dynamic(() => import("./components/Governance"));
const Architecture = dynamic(() => import("./components/Architecture"));
const Manifesto = dynamic(() => import("./components/Manifesto"));
const Proof = dynamic(() => import("./components/Proof"));
const Pricing = dynamic(() => import("./components/Pricing"));
const Social = dynamic(() => import("./components/Social"));
const Faq = dynamic(() => import("./components/Faq"));
const Cta = dynamic(() => import("./components/Cta"));
const Footer = dynamic(() => import("./components/Footer"));

const displayFont = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-orn-display",
  display: "swap",
});

const bodyFont = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-orn-body",
  display: "swap",
});

const monoFont = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-orn-mono",
  display: "swap",
});

const title = "Ordin - AI Infrastructure SaaS Template";
const description =
  "A minimal, scroll-driven landing template for AI and SaaS products, with an Aurora Ribbon shader, a particle globe and a mint and forest-green palette.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "https://vault.hyperiux.com/templates/ordin" },
  openGraph: { title, description },
  twitter: { card: "summary_large_image", title, description },
};

const tokens = {
  "--orn-mint": theme.mint,
  "--orn-mint-highlight": theme.mintHighlight,
  "--orn-accent": theme.accent,
  "--orn-light": theme.light,
  "--orn-light-alt": theme.lightAlt,
  "--orn-forest": theme.forest,
  "--orn-surface": theme.surface,
  "--orn-raised": theme.raised,
  "--orn-text": theme.text,
  "--orn-text-muted": theme.textMuted,
  "--orn-text-on-dark": theme.textOnDark,
  "--orn-text-on-dark-muted": theme.textOnDarkMuted,
  "--orn-border": theme.border,
  "--orn-border-dark": theme.borderDark,
} as CSSProperties;

const page = () => {
  return (
    <div style={tokens} className={`orn-page relative overflow-x-clip ${displayFont.variable} ${bodyFont.variable} ${monoFont.variable}`}>
      <noscript>
        <style>{".orn-page [data-orn-split],.orn-page [data-orn-fade]{visibility:visible!important}"}</style>
      </noscript>
      <LenisSmoothScroll />
      <AuroraLayer />
      <Header />
      <main className="relative z-[1]">
        <Hero />
        <Execution />
        <Specialists />
        <Governance />
        <Architecture />
        <Manifesto />
        <Proof />
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
