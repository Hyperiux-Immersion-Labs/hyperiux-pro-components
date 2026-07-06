import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { getAllPrivateEffects, getEffectBySlug } from "@/lib/registry";

import {
  getAllSanityEffectEntries,
  getSanityEffectContent,
  buildEffectsFromSanity,
  getEffectsByCategoryFromSanity,
} from "@/lib/sanity";
import { getUserPlan, canAccessEffect } from "@/lib/subscription";
import { EffectDetailContent } from "../effect-detail";
import { BreadcrumbsJSONLD, FAQJSONLD, WebpageJsonLd } from "@/lib/json-ld";
import { createPageMetadata } from "@/lib/seo-metadata";
import { resolveOgImageUrl } from "@/lib/media";

function getFallbackContent(effect, effectSlug) {
  if (!effect) return null;

  const title = effect.title || effectSlug;
  const description = effect.description || "";

  return {
    title,
    summary: description,
    seo: {
      title,
      description,
      metaTitle: title,
      metaDescription: description,
      primaryKeyword: effectSlug,
      secondaryKeywords: [],
    },
    body: [],
    ctaBanner: null,
    coverImage: effect.coverImage || effectSlug,
    videoUrl: effect.videoUrl || `${effectSlug}.mp4`,
    tier: effect.tier || "pro",
    relatedEffectNames: [],
  };
}

function getEffectPageMetadata(effect, content, slug, effectSlug) {
  const title =
    content?.seo?.metaTitle ||
    content?.seo?.title ||
    `${effect?.title || effectSlug} | Hyperiux Vault`;
  const description =
    content?.seo?.metaDescription ||
    content?.seo?.description ||
    content?.summary ||
    effect?.description;
  const image =
    resolveOgImageUrl(content?.coverImage || effect?.coverImage || effectSlug, {
      defaultDirectory: "vault-listing-images",
      defaultExtension: "png",
    }) || "/seo/homepage.png";

  return createPageMetadata({
    title,
    description,
    path: `/effects/${slug}/${effectSlug}`,
    image,
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
  const params = new Map();

  for (const entry of entries) {
    params.set(`${entry.categorySlug}/${entry.effectSlug}`, {
      slug: entry.categorySlug,
      effectSlug: entry.effectSlug,
    });
  }

  for (const effect of getAllPrivateEffects()) {
    if (!effect.effectSlug || !effect.categorySlug) continue;

    params.set(`${effect.categorySlug}/${effect.effectSlug}`, {
      slug: effect.categorySlug,
      effectSlug: effect.effectSlug,
    });
  }

  return [...params.values()];
}

export async function generateMetadata({ params }) {
  const { slug, effectSlug } = await params;
  const effect = getEffectBySlug(effectSlug);
  const content =
    (await getSanityEffectContent(slug, effectSlug)) ||
    getFallbackContent(effect, effectSlug);

  if (!content && !effect) {
    return createPageMetadata({
      title: "Effect Not Found",
      description: "Effect not found.",
      path: `/effects/${slug}/${effectSlug}`,
      image: "/seo/homepage.png",
    });
  }

  return getEffectPageMetadata(effect, content, slug, effectSlug);
}

export default async function EffectPage({ params }) {
  const { slug, effectSlug } = await params;

  const effect = getEffectBySlug(effectSlug);
  const content =
    (await getSanityEffectContent(slug, effectSlug)) ||
    getFallbackContent(effect, effectSlug);

  if (!content && !effect) {
    notFound();
  }

  const { userId } = await auth();
  const userPlan = await getUserPlan(userId);
  const effectTier = content.tier ?? effect?.tier ?? "pro";
  const isLocked = !canAccessEffect(effectTier, userPlan, userId);

  const sanityEntries = await getAllSanityEffectEntries();
  const allEffects = buildEffectsFromSanity(sanityEntries);
  const categoriesMap = getEffectsByCategoryFromSanity(sanityEntries);

  const globalSearchEffects = [...allEffects].sort((a, b) => (b.addedAt ?? 0) - (a.addedAt ?? 0));

  const effectCounts = {};
  for (const [categoryId, catEffects] of Object.entries(categoriesMap)) {
    effectCounts[categoryId] = catEffects.length;
  }

  const relatedEffectNames = content?.relatedEffectNames || [];

  let relatedEffects = relatedEffectNames
    .map((relatedName) => {
      const normalizedRelatedName = normalize(relatedName);

      return allEffects.find((item) => {
        return (
          normalize(item.title) === normalizedRelatedName ||
          normalize(item.name) === normalizedRelatedName ||
          normalize(item.slug) === normalizedRelatedName
        );
      });
    })
    .filter(Boolean)
    .filter((item) => item.name !== effectSlug);

  if (relatedEffects.length === 0) {
    relatedEffects = allEffects
      .filter((item) => item.categorySlug === slug && item.name !== effectSlug)
      .slice(0, 5);
  }

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
        totalEffects={sanityEntries.length}
        isLocked={isLocked}
        effectTier={effectTier}
        userPlan={userPlan}
        searchEffects={globalSearchEffects}
      />
    </>
  );
}
