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
import { BreadcrumbsJSONLD, FAQJSONLD, WebpageJsonLd } from "@/lib/json-ld";
import { createPageMetadata } from "@/lib/seo-metadata";

function getEffectPageMetadata(effect, content, slug, effectSlug) {
  const title =
    content?.seo?.metaTitle ||
    content?.seo?.title ||
    `${effect.title} | Hyperiux Vault`;
  const description =
    content?.seo?.metaDescription ||
    content?.seo?.description ||
    content?.summary ||
    effect.description;

  return createPageMetadata({
    title,
    description,
    path: `/effects/${slug}/${effectSlug}`,
    keywords: [
      content?.seo?.primaryKeyword,
      ...(content?.seo?.secondaryKeywords || []),
    ].filter(Boolean),
  });
}

function normalizeFaqText(value) {
  if (!value) return "";

  if (typeof value === "string") return value;

  if (Array.isArray(value)) {
    return value
      .map((item) => normalizeFaqText(item))
      .filter(Boolean)
      .join(" ");
  }

  if (typeof value === "object") {
    if (value.text) return value.text;
    if (value.children) return normalizeFaqText(value.children);
    if (value.content) return normalizeFaqText(value.content);
  }

  return "";
}

function getSanityFaqs(content) {
  return (content?.body || [])
    .filter((block) => block?._type === "effectFaqAccordion")
    .flatMap((block) => block.items || [])
    .map((item) => ({
      question: normalizeFaqText(item.question).trim(),
      answer: normalizeFaqText(item.answer).trim(),
    }))
    .filter((item) => item.question && item.answer);
}

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
    return createPageMetadata({
      title: "Effect Not Found",
      description: "Effect not found.",
      path: `/effects/${slug}/${effectSlug}`,
    });
  }

  return getEffectPageMetadata(effect, content, slug, effectSlug);
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
  const sanityEffectSlugs = new Set(
    sanityEntries
      .map((entry) => normalize(entry.effectSlug))
      .filter(Boolean)
  );

  const pinnedRelatedEffects = relatedEffectNames
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
    .filter((item) => item.name !== effectSlug);

  const pinnedRelatedSlugs = new Set(
    pinnedRelatedEffects.flatMap((item) => [
      normalize(item.name),
      normalize(item.slug),
      normalize(item.effectSlug),
    ])
  );

  const remainingSanityEffects = registryItems.filter((item) => {
    const normalizedName = normalize(item.name);
    const normalizedSlug = normalize(item.slug);
    const normalizedEffectSlug = normalize(item.effectSlug);

    if (item.name === effectSlug) return false;
    if (pinnedRelatedSlugs.has(normalizedName)) return false;
    if (pinnedRelatedSlugs.has(normalizedSlug)) return false;
    if (pinnedRelatedSlugs.has(normalizedEffectSlug)) return false;

    return (
      sanityEffectSlugs.has(normalizedName) ||
      sanityEffectSlugs.has(normalizedSlug) ||
      sanityEffectSlugs.has(normalizedEffectSlug)
    );
  });

  const relatedEffects = [
    ...pinnedRelatedEffects,
    ...remainingSanityEffects,
  ];
  const pageMetadata = getEffectPageMetadata(effect, content, slug, effectSlug);
  const faqItems = getSanityFaqs(content);


  return (
    <>
      <WebpageJsonLd metadata={pageMetadata} />
      <BreadcrumbsJSONLD pathname={pageMetadata.url} />
      {faqItems.length > 0 && <FAQJSONLD faqs={faqItems} />}
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
    </>
  );
}
