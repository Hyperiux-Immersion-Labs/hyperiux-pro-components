import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import {
  getAllEffectSlugs,
  getEffectBySlug,
  getEffectsByCategory,
  getRegistryIndex,
} from "@/lib/registry";
import { getEffectHref } from "@/lib/categories";

import {
  applySanityCategorySlugs,
  getAllSanityEffectEntries,
  getSanityEffectContent,
} from "@/lib/sanity";
import { getUserPlan, canAccessEffect } from "@/lib/subscription";
import { EffectDetailContent } from "../effect-detail";

function normalize(value = "") {
  return value
    .toString()
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/\s+/g, "-");
}

export async function generateStaticParams() {
  const entries = await getAllSanityEffectEntries();
  const registry = getRegistryIndex();
  const params = new Map();

  for (const entry of entries) {
    params.set(`${entry.categorySlug}/${entry.effectSlug}`, {
      slug: entry.categorySlug,
      effectSlug: entry.effectSlug,
    });
  }

  for (const effect of registry.items) {
    const [, , categorySlug, effectSlug] = getEffectHref(effect).split("/");

    if (!categorySlug || !effectSlug) continue;

    params.set(`${categorySlug}/${effectSlug}`, {
      slug: categorySlug,
      effectSlug,
    });
  }

  return [...params.values()];
}

export async function generateMetadata({ params }) {
  const { slug, effectSlug } = await params;

  const effect = getEffectBySlug(effectSlug);
  const content = await getSanityEffectContent(slug, effectSlug);

  if (!effect) {
    return {
      title: "Effect Not Found",
    };
  }

  return {
    title: content?.seo?.title || `${effect.title} | Hyperiux Vault`,
    description: content?.seo?.description || effect.description,
    keywords: [
      content?.seo?.primaryKeyword,
      ...(content?.seo?.secondaryKeywords || []),
    ].filter(Boolean),
  };
}

export default async function EffectPage({ params }) {
  const { slug, effectSlug } = await params;

  const effect = getEffectBySlug(effectSlug);
  const content = await getSanityEffectContent(slug, effectSlug);

  if (!effect) {
    notFound();
  }

  // Determine access: check Clerk session and subscription plan
  const { userId } = await auth();
  const userPlan = await getUserPlan(userId);
  const isLocked = !canAccessEffect(effect.tier ?? "pro", userPlan);

  const registry = getRegistryIndex();
  const sanityEntries = await getAllSanityEffectEntries();
  const registryItems = applySanityCategorySlugs(registry.items, sanityEntries);

  const categoriesMap = getEffectsByCategory();

  const effectCounts = {};

  for (const [categoryId, effects] of Object.entries(categoriesMap)) {
    effectCounts[categoryId] = effects.length;
  }
  /*
    ----------------------------------------
    RELATED EFFECTS FROM DATA
    ----------------------------------------
  */

  const relatedEffectNames = content?.relatedEffectNames || [];

  const relatedEffects = relatedEffectNames
    .map((relatedName) => {
      const normalizedRelatedName = normalize(relatedName);

      return registryItems.find((item) => {
        const normalizedTitle = normalize(item.title);

        const normalizedName = normalize(item.name);

        const normalizedSlug = normalize(item.slug);

        return (
          normalizedTitle === normalizedRelatedName ||
          normalizedName === normalizedRelatedName ||
          normalizedSlug === normalizedRelatedName
        );
      });
    })
    .filter(Boolean)
    .filter((item) => item.name !== effectSlug)
    .slice(0, 3);


  return (
    <EffectDetailContent
      slug={effectSlug}
      categorySlug={slug}
      effect={effect}
      content={content}
      relatedEffects={relatedEffects}
      effectCounts={effectCounts}
      totalEffects={getAllEffectSlugs().length}
      isLocked={isLocked}
      userPlan={userPlan}
    />
  );
}
