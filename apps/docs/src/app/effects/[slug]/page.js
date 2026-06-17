import { Suspense } from "react";
import { notFound } from "next/navigation";
import {
  getEffectCategoryBySlug,
  getEffectCategoryContent,
  getEffectCategoryMetadata,
} from "@/lib/categories";
import { getEffectsByCategory, getRegistryIndex } from "@/lib/registry";
import { VaultContent } from "../vault-content";
import { getUserPlan } from "@/lib/subscription";
import { auth } from "@clerk/nextjs/server";
import { applySanityCategorySlugs, getAllSanityEffectEntries } from "@/lib/sanity";
import { getFeaturedEffects } from "@/lib/featured-effects";
import { BreadcrumbsJSONLD, FAQJSONLD, WebpageJsonLd } from "@/lib/json-ld";

function VaultFallback() {
  return (
    <div className="h-screen w-screen bg-black">
    </div>
  );
}

export async function generateStaticParams() {
  const slugs = new Set();

  slugs.add("free");
  slugs.add("featured");

  for (const categorySlug of Object.keys(getEffectsByCategory())) {
    const category = getEffectCategoryBySlug(categorySlug);
    slugs.add(categorySlug);
    slugs.add(category?.slug || categorySlug);
  }

  return [...slugs].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;

  const category = getEffectCategoryBySlug(slug);

  if (slug === "free" || slug === "featured" || category) {
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
  const category = getEffectCategoryBySlug(slug);
  const categoriesMap = getEffectsByCategory();
  const userPlan = await getUserPlan(userId);

  // Get effect counts for sidebar
  const effectCounts = {};
  for (const [categoryId, effects] of Object.entries(categoriesMap)) {
    effectCounts[categoryId] = effects.length;
  }

  const registry = getRegistryIndex();
  const sanityEntries = await getAllSanityEffectEntries();
  const effects = applySanityCategorySlugs(registry.items, sanityEntries);
  const sortedEffects = [...effects].sort((a, b) => (b.addedAt ?? 0) - (a.addedAt ?? 0));

  effectCounts.featured = getFeaturedEffects(sortedEffects).length;

  if (!isFreeListing && !isFeaturedListing && (!category || !categoriesMap[category.id])) {
    notFound();
  }

  const pageMetadata = getEffectCategoryMetadata(
    isFreeListing ? "free" : isFeaturedListing ? "featured" : category
  );
  const pageContent = getEffectCategoryContent(
    isFreeListing ? "free" : isFeaturedListing ? "featured" : category
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
          initialCategory={isFreeListing ? "free" : isFeaturedListing ? "featured" : category.id}
          userPlan={userPlan}
        />
      </Suspense>
    </>
  );
}
