import AgencyProof from "@/components/LandingPage/AgencyProof";
import AgencyProofMobile from "@/components/LandingPage/AgencyProofMobile";
import FeaturedEffects from "@/components/LandingPage/FeaturedEffects";
import Footer from "@/components/LandingPage/Footer";
import FreeVault from "@/components/LandingPage/FreeVault";
import Hero from "@/components/LandingPage/Hero";
import FeaturedStoryTelling from "@/components/LandingPage/FeaturedStoryTelling";
import StorytellingMobile from "@/components/LandingPage/StorytellingMobile";
import VaultGridMobile from "@/components/LandingPage/VaultGridMobile";
import Workflow from "@/components/LandingPage/Workflow";
import GlowingPlates from "@/Experience/GlowingPlates";
import ReflectiveRods from "@/Experience/ReflectiveRods";
import VaultShell from "@/Layouts/VaultShell";
import CTA from "@/components/LandingPage/CTA";

export default function page() {
  return (

    <VaultShell>
      <Hero />
      <GlowingPlates />
      <FeaturedStoryTelling />
      <StorytellingMobile />
      <VaultGridMobile />
      <FeaturedEffects />
      <Workflow />
      <FreeVault />
      <AgencyProof />
      <AgencyProofMobile />
      <CTA />
      <Footer />
    </VaultShell>
  )
}
