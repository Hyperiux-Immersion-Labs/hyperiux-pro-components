import React, { Suspense } from "react";
import { getEffectsByCategory, getRegistryIndex } from "@/lib/registry";
import { VaultLayout } from "@/components/layout/VaultLayout";
import DocsBody from "./DocsBody";
import { VaultHeader } from "@/components/layout/VaultHeader";
import Footer from "@/components/LandingPage/Footer";
import NavbarMobile from "@/components/WebsiteComps/NavbarMobile";

function VaultLayoutFallback() {
  return (
    <div className="flex">
      <aside className="sticky bottom-0 left-0 top-0 h-screen border-r border-white/10 bg-[#060606] w-22" />
      <div className="flex-1 bg-[#1111111]" />
    </div>
  );
}

export default function Layout({ children }) {
  const categories = getEffectsByCategory();
  const registry = getRegistryIndex();

  const effectCounts = {};
  for (const [category, effects] of Object.entries(categories)) {
    effectCounts[category] = effects.length;
  }

  const totalEffects = registry?.items?.length ?? 0;

  return (
    <>
      <Suspense fallback={<VaultLayoutFallback />}>
          <NavbarMobile/>
      
        <VaultLayout effectCounts={effectCounts} totalEffects={totalEffects}>
          <div className=" h-fit bg-[#1111111] text-foreground px-15 max-md:px-[6vw] max-sm:px-[7vw] pb-8">
            <React.Suspense fallback={<div className="h-12" />}>
              <VaultHeader showSearch totalEffects={totalEffects} effects={registry?.items || []} />
            </React.Suspense>
            <DocsBody>{children}</DocsBody>
          </div>
        </VaultLayout>
      </Suspense>
      <Footer />
    </>
  );
}
