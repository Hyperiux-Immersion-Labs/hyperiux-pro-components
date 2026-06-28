import { getRegistryIndex } from "@/lib/registry";
import {
  mergeRegistryWithSanity,
  getAllSanityEffectEntries,
} from "@/lib/sanity";
import { getEffectHref } from "@/lib/categories";

export const dynamic = "force-static";
export const revalidate = 3600;

function normalizeEffectForSearch(effect) {
  const href = getEffectHref(effect);
  const hrefParts = href.split("/").filter(Boolean);

  const categorySlug =
    effect.categorySlug ||
    hrefParts[1] ||
    effect.category ||
    effect.categories?.[0] ||
    "featured";

  const effectSlug =
    effect.effectSlug ||
    effect.slug ||
    effect.name ||
    hrefParts[2];

  return {
    name: effect.name,
    title: effect.title,
    description: effect.description,
    category: effect.category,
    categories: effect.categories || [],
    slug: effect.slug,
    effectSlug,
    categorySlug,
    tier: effect.tier,
    addedAt: effect.addedAt ?? 0,
    dependencies: effect.dependencies || [],
    href,
  };
}

export async function GET() {
  const registry = getRegistryIndex();
  const sanityEntries = await getAllSanityEffectEntries();

  const effects = mergeRegistryWithSanity(registry.items, sanityEntries);

  const sortedEffects = [...effects].sort(
    (a, b) => (b.addedAt ?? 0) - (a.addedAt ?? 0)
  );

  const searchableEffects = sortedEffects.map(normalizeEffectForSearch);

  return Response.json({
    effects: searchableEffects,
    total: searchableEffects.length,
  });
}