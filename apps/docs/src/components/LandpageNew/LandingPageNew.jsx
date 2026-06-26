"use client";

import GlowingPlates from "@/Experience/GlowingPlates";
import VaultShell from "@/Layouts/VaultShell";
import Loader from "@/components/WebsiteComps/Loader";

import Hero from "./Hero";
import TrustStrip from "./TrustStrip";
import Problem from "./Problem";
import Tension from "./Tension";
import Solution from "./Solution";
import FeaturedStoryTelling from "./FeaturedStoryTelling";

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
