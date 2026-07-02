import VaultShell from "@/Layouts/VaultShell";
import Hero from "@/components/Pricing/Hero";
import Pricing from "@/components/LandpageV2/Pricing";
import GlowingPlates from "@/Experience/GlowingPlates";
import CTA from "@/components/LandingPage/CTA";
import Footer from "@/components/LandingPage/Footer";

export const metadata = {
  title: "Hyperiux Vault Pricing | Pro React Effects Library",
  description: "Get unlimited access to premium, highly interactive React and Tailwind components. Elevate your website design with fluid animations, custom cursors, and advanced WebGL components.",
};



export default function PricingPage() {
  return (
    <>
      <VaultShell>
        <Hero />
        <GlowingPlates waitForLoader={false} />
        {/* <Pricing enableColorSwitch={false} /> */}
        <Pricing padding="pt-[30vw]!" />
        <CTA />
        <Footer />
      </VaultShell>
    </>
  );
}
