import { Suspense } from "react";
import { notFound } from "next/navigation";
import {
  getEffectCategoryBySlug,
  getEffectCategoryContent,
  getEffectCategoryMetadata,
} from "@/lib/categories";
import { VaultContent } from "../vault-content";
import { getUserPlan } from "@/lib/subscription";
import { auth } from "@clerk/nextjs/server";
import {
  getAllSanityEffectEntries,
  buildEffectsFromSanity,
  getEffectsByCategoryFromSanity,
} from "@/lib/sanity";
import { getFeaturedEffects } from "@/lib/featured-effects";
import { sortEffects } from "@/lib/effect-sort";
import { BreadcrumbsJSONLD, FAQJSONLD, WebpageJsonLd } from "@/lib/json-ld";

function VaultFallback() {
  return (
    <div className="min-h-[300vh] w-screen bg-black">
    </div>
  );
}

export async function generateStaticParams() {
  const entries = await getAllSanityEffectEntries();
  const slugs = new Set(["free", "featured", "pro"]);

  for (const entry of entries) {
    if (entry.categorySlug) {
      const category = getEffectCategoryBySlug(entry.categorySlug);
      slugs.add(entry.categorySlug);
      slugs.add(category?.slug || entry.categorySlug);
    }
  }

  return [...slugs].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;

  const category = getEffectCategoryBySlug(slug);

  if (slug === "free" || slug === "featured" || slug === "pro" || category) {
    return getEffectCategoryMetadata(slug);
  }

  return getEffectCategoryMetadata("all", {
    title: "Category Not Found",
    description: "Effect category not found.",
    url: `/effects/${slug}`,
  });
}

export default async function EffectsCategoryPage({ params }) {
  const { userId } = await auth();
  const { slug } = await params;
  const isFreeListing = slug === "free";
  const isFeaturedListing = slug === "featured";
  const isProListing = slug === "pro";
  const category = getEffectCategoryBySlug(slug);
  const userPlan = await getUserPlan(userId);

  const sanityEntries = await getAllSanityEffectEntries();
  const effects = buildEffectsFromSanity(sanityEntries);
  const categoriesMap = getEffectsByCategoryFromSanity(sanityEntries);
  const sortedEffects = sortEffects(effects);

  const effectCounts = {};
  for (const [categoryId, catEffects] of Object.entries(categoriesMap)) {
    effectCounts[categoryId] = catEffects.length;
  }
  effectCounts.featured = getFeaturedEffects(sortedEffects).length;

  if (!isFreeListing && !isFeaturedListing && !isProListing && (!category || !categoriesMap[category.id])) {
    notFound();
  }

  const pageMetadata = getEffectCategoryMetadata(
    isFreeListing ? "free" : isFeaturedListing ? "featured" : isProListing ? "pro" : category
  );
  const pageContent = getEffectCategoryContent(
    isFreeListing ? "free" : isFeaturedListing ? "featured" : isProListing ? "pro" : category
  );

  return (
    <>
      <WebpageJsonLd metadata={pageMetadata} />
      <BreadcrumbsJSONLD pathname={pageMetadata.url} />
      {pageContent.faqs?.length > 0 && <FAQJSONLD faqs={pageContent.faqs} />}
      <Suspense fallback={<VaultFallback />}>
        <VaultContent
          effects={sortedEffects}
          effectCounts={effectCounts}
          initialCategory={isFreeListing ? "free" : isFeaturedListing ? "featured" : isProListing ? "pro" : category.id}
          userPlan={userPlan}
        />
      </Suspense>
    </>
  );
}
