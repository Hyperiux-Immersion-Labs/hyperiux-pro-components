import VaultShell from "@/Layouts/VaultShell";
import Hero from "@/components/Pricing/Hero";
import Pricing from "@/components/LandingPage/Pricing";
import GlowingPlates from "@/Experience/GlowingPlates";
import CTA from "@/components/LandingPage/CTA";
import Footer from "@/components/LandingPage/Footer";

export default function PricingPage() {
  return (
    <>
      <VaultShell>
        <Hero />
        <GlowingPlates />
        <Pricing enableColorSwitch={false} />
        <CTA />
        <Footer />
      </VaultShell>
    </>
    
  );
}
