import AgencyProof from "@/components/LandingPage/AgencyProof";
import FeaturedEffects from "@/components/LandingPage/FeaturedEffects";
import Footer from "@/components/LandingPage/Footer";
import FreeVault from "@/components/LandingPage/FreeVault";
import Hero from "@/components/LandingPage/Hero";
import FeaturedStoryTelling from "@/components/LandingPage/FeaturedStoryTelling";
import Workflow from "@/components/LandingPage/Workflow";
import GlowingPlates from "@/Experience/GlowingPlates";
import ReflectiveRods from "@/Experience/ReflectiveRods";
import VaultShell from "@/Layouts/VaultShell";
import CTA from "@/components/LandingPage/CTA";

export default function page() {
  return (

    <VaultShell>
      <Hero />
      {/* <GlowingPlates /> */}
      <FeaturedStoryTelling />
      <FeaturedEffects />
      <Workflow />
      <FreeVault />
      <AgencyProof />
      <CTA />
      <Footer />
    </VaultShell>
  )
}
