// Built using Hyperiux Vault: https://vault.hyperiux.com
import "./missing-pixel-styles.css";
import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { DM_Sans, Host_Grotesk } from "next/font/google";
import PixelTransition from "./components/effects/pixel-transition";
import DeferredEffects from "./components/shared/DeferredEffects";
import Header from "./components/shared/Header";
import ScrollTopOnLoad from "./components/shared/ScrollTopOnLoad";

const Footer = dynamic(() => import("./components/shared/Footer"));
const FooterCta = dynamic(() => import("./components/shared/FooterCta"));

const headFont = Host_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-mpx-head",
  display: "swap",
});

const bodyFont = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mpx-body",
  display: "swap",
});

const layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className={`mpx-page relative ${headFont.variable} ${bodyFont.variable}`}>
      <PixelTransition />
      <ScrollTopOnLoad />
      <DeferredEffects />
      <Header />
      <main data-mpx-inert className="relative z-2 rounded-b-3xl bg-(--mpx-paper)">
        {children}
        <FooterCta />
      </main>
      <Footer />
    </div>
  );
};

export default layout;
