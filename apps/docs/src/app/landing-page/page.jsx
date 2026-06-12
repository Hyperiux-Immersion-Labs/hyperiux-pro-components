import AgencyProof from "@/components/LandingPage/AgencyProof";
import FeaturedEffects from "@/components/LandingPage/FeaturedEffects";
import Footer from "@/components/LandingPage/Footer";
import FreeVault from "@/components/LandingPage/FreeVault";
import Hero from "@/components/LandingPage/Hero";
import SpiralImages from "@/components/LandingPage/SpiralImages";
import VaultGrid from "@/components/LandingPage/VaultGrid";
import Workflow from "@/components/LandingPage/Workflow";
import GlowingPlates from "@/Experience/GlowingPlates";
import ReflectiveRods from "@/Experience/ReflectiveRods";
import VaultShell from "@/Layouts/VaultShell";

export default function page() {
  return (

    <VaultShell>
      <Hero />
      {/* <GlowingPlates /> */}
      <SpiralImages />
      <VaultGrid />
      <FeaturedEffects />
      <Workflow />
      <FreeVault />
      <AgencyProof />
      <Footer />
    </VaultShell>
  )
}
