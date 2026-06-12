import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getEffectCategoryBySlug } from "@/lib/categories";
import { getEffectsByCategory, getRegistryIndex } from "@/lib/registry";
import { VaultContent } from "../vault-content";
import { getUserPlan } from "@/lib/subscription";
import { auth } from "@clerk/nextjs/server";
import { applySanityCategorySlugs, getAllSanityEffectEntries } from "@/lib/sanity";

function VaultFallback() {
  return (
    <div className="h-screen w-screen bg-black">
    </div>
  );
}

export async function generateStaticParams() {
  const slugs = new Set();

  slugs.add("free");

  for (const categorySlug of Object.keys(getEffectsByCategory())) {
    const category = getEffectCategoryBySlug(categorySlug);
    slugs.add(categorySlug);
    slugs.add(category?.slug || categorySlug);
  }

  return [...slugs].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;

  if (slug === "free") {
    return {
      title: "Free Effects | Hyperiux Vault",
      description: "Browse free effects in the Hyperiux Vault",
    };
  }

  const category = getEffectCategoryBySlug(slug);

  if (category) {
    return {
      title: `${category.name} | Hyperiux Vault`,
      description: `Browse ${category.name.toLowerCase()} in the Hyperiux Vault`,
    };
  }

  return { title: "Category Not Found" };
}

export default async function EffectsCategoryPage({ params }) {
  const { userId } = await auth();
  const { slug } = await params;
  const isFreeListing = slug === "free";
  const category = getEffectCategoryBySlug(slug);
  const categoriesMap = getEffectsByCategory();
  const userPlan = await getUserPlan(userId);

  // Get effect counts for sidebar
  const effectCounts = {};
  for (const [categoryId, effects] of Object.entries(categoriesMap)) {
    effectCounts[categoryId] = effects.length;
  }

  if (!isFreeListing && (!category || !categoriesMap[category.id])) {
    notFound();
  }

  const registry = getRegistryIndex();
  const sanityEntries = await getAllSanityEffectEntries();
  const effects = applySanityCategorySlugs(registry.items, sanityEntries);

  return (
    <Suspense fallback={<VaultFallback />}>
      <VaultContent
        key={isFreeListing ? "free" : category.id}
        effects={[...effects].sort((a, b) => (b.addedAt ?? 0) - (a.addedAt ?? 0))}
        effectCounts={effectCounts}
        initialCategory={isFreeListing ? "free" : category.id}
        userPlan={userPlan}
      />
    </Suspense>
  );
}
