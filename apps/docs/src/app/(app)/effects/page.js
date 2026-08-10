import { Suspense } from "react";
import { VaultContent } from "./vault-content";
import { getUserPlan } from "@/lib/subscription";
import { auth } from "@clerk/nextjs/server";
import {
  getAllSanityEffectEntries,
  buildEffectsFromSanity,
  getEffectsByCategoryFromSanity,
} from "@/lib/sanity";
import { getFeaturedEffects } from "@/lib/featured-effects";
import {
  getEffectCategoryContent,
  getEffectCategoryMetadata,
} from "@/lib/categories";
import { BreadcrumbsJSONLD, FAQJSONLD, WebpageJsonLd } from "@/lib/json-ld";

export const metadata = getEffectCategoryMetadata("all");
const pageContent = getEffectCategoryContent("all");

function VaultFallback() {
  return <div className="min-h-[300vh] w-screen bg-black"></div>;
}

export default async function EffectsPage() {
  const sanityEntries = await getAllSanityEffectEntries();
  const effects = buildEffectsFromSanity(sanityEntries);
  const categories = getEffectsByCategoryFromSanity(sanityEntries);
  const sortedEffects = [...effects].sort(
    (a, b) => (b.addedAt ?? 0) - (a.addedAt ?? 0),
  );

  const effectCounts = {};
  for (const [category, catEffects] of Object.entries(categories)) {
    effectCounts[category] = catEffects.length;
  }
  effectCounts.featured = getFeaturedEffects(sortedEffects).length;
  const { userId } = await auth();
  const userPlan = await getUserPlan(userId);
  return (
    <>
      <WebpageJsonLd metadata={metadata} />
      <BreadcrumbsJSONLD pathname={metadata.url} />
      {pageContent.faqs?.length > 0 && <FAQJSONLD faqs={pageContent.faqs} />}
      <Suspense fallback={<VaultFallback />}>
        <VaultContent
          effects={sortedEffects}
          effectCounts={effectCounts}
          userPlan={userPlan}
        />
      </Suspense>
    </>
  );
}
