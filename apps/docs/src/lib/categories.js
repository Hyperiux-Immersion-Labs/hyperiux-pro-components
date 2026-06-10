import { getEffectRouteSlug } from "./effect-slugs";

export const effectCategories = [
  { id: "all", name: "All Effects", slug: "all" },
  { id: "text", name: "Text Animations", slug: "text-animations", aliases: ["text-effects"] },
  { id: "backgrounds", name: "Backgrounds", slug: "backgrounds" },
  { id: "buttons", name: "Buttons", slug: "buttons" },
  { id: "carousels", name: "Carousels", slug: "carousels" },
  { id: "scroll", name: "Scroll Animations", slug: "scroll-effects" },
  { id: "components", name: "Components", slug: "components" },
  { id: "navigation", name: "Navigation", slug: "navigation" },
  { id: "cursor", name: "Cursor Effects", slug: "cursor-effects" },
  { id: "transitions", name: "Page Transitions", slug: "page-transitions" },
  { id: "loaders", name: "Loaders", slug: "loaders", aliases: ["website-loaders"] },
  { id: "webgl", name: "WebGL Effects", slug: "webgl-effects", aliases: ["webgl"] },
  { id: "others", name: "Others", slug: "others" },
];

const categoriesById = new Map(effectCategories.map((category) => [category.id, category]));
const categoriesBySlug = new Map(
  effectCategories.flatMap((category) =>
    [category.slug, ...(category.aliases || [])].map((slug) => [slug, category])
  )
);

export function getEffectCategory(id) {
  return categoriesById.get(id) || null;
}

export function getEffectCategoryBySlug(slug) {
  const normalizedSlug = slug?.toString().toLowerCase();

  return categoriesBySlug.get(normalizedSlug) || categoriesById.get(normalizedSlug) || null;
}

export function getEffectCategorySlugAliases(slug) {
  const normalizedSlug = slug?.toString().toLowerCase();
  const category = getEffectCategoryBySlug(normalizedSlug);

  return [
    category?.slug,
    category?.id,
    ...(category?.aliases || []),
    normalizedSlug,
    slug,
  ].filter((value, index, values) => value && values.indexOf(value) === index);
}

export function getEffectCategoryHref(id) {
  if (id === "all") return "/effects";

  const category = getEffectCategory(id);
  return `/effects/${category?.slug || id}`;
}

export function getEffectPrimaryCategory(effect) {
  const categories = effect?.categories?.length
    ? effect.categories
    : [effect?.category || "others"];

  return categories[0] || "others";
}

export function getEffectHref(effect) {
  const effectSlug = getEffectRouteSlug(effect?.effectSlug || effect?.slug || effect?.name);

  if (!effectSlug) return "/effects";

  if (effect?.categorySlug) {
    const category = getEffectCategoryBySlug(effect.categorySlug);
    const categorySlug = category?.slug || effect.categorySlug;

    return `/effects/${categorySlug}/${effectSlug}`;
  }

  const categoryId = effect.categories?.[0] || effect.category || "others";

  const category = getEffectCategory(categoryId);

  const categorySlug = category?.slug || categoryId;

  return `/effects/${categorySlug}/${effectSlug}`;
}

export function getEffectPreviewHref(effect) {
  const effectSlug = getEffectRouteSlug(effect?.effectSlug || effect?.slug || effect?.name);

  return effectSlug ? `/demo/${effectSlug}` : "/effects";
}
