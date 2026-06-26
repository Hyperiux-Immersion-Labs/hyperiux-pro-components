"use client";

import GlowingPlates from "@/Experience/GlowingPlates";
import VaultShell from "@/Layouts/VaultShell";
import Loader from "@/components/WebsiteComps/Loader";
import TrustStrip from "./TrustStrip";
import Problem from "./Problem";
import Tension from "./Tension";
import Solution from "./Solution";
import FeaturedStoryTelling from "./FeaturedStoryTelling";
import Hero from "./Hero";

export default function LandingPageNew() {

  return (
    <>
      <VaultShell>
        <Loader />
        <Hero />
        <GlowingPlates />
        <TrustStrip />
        <Problem />
        <Tension />
        <Solution />
        <FeaturedStoryTelling />


      </VaultShell>
    </>
  );
}
