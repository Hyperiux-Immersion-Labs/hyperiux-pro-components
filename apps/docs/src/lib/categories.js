export const effectCategories = [
  { id: "all", name: "All Effects", slug: "all" },
  { id: "text", name: "Text Animations", slug: "text-animations" },
  { id: "backgrounds", name: "Backgrounds", slug: "backgrounds" },
  { id: "buttons", name: "Buttons", slug: "buttons" },
  { id: "carousels", name: "Carousels", slug: "carousels" },
  { id: "scroll", name: "Scroll Animations", slug: "scroll-effects" },
  { id: "components", name: "Components", slug: "components" },
  { id: "navigation", name: "Navigation", slug: "navigation" },
  { id: "cursor", name: "Cursor Effects", slug: "cursor-effects" },
  { id: "transitions", name: "Page Transitions", slug: "page-transitions" },
  { id: "loaders", name: "Website Loaders", slug: "loaders" },
  { id: "webgl", name: "WebGL Effects", slug: "webgl-effects" },
  { id: "others", name: "Others", slug: "others" },
];

const categoriesById = new Map(effectCategories.map((category) => [category.id, category]));
const categorySlugAliases = {
  text: "text",
  "text-effects": "text",
  "text-animations": "text",
  transitions: "transitions",
  "page-transitions": "transitions",
  loader: "loaders",
  loaders: "loaders",
  "website-loader": "loaders",
  "website-loaders": "loaders",
  webgl: "webgl",
  "webgl-effects": "webgl",
  scroll: "scroll",
  "scroll-effects": "scroll",
  "scroll-animations": "scroll",
  cursor: "cursor",
  "cursor-effects": "cursor",
};
const categoriesBySlug = new Map([
  ...effectCategories.map((category) => [category.slug, category]),
  ...Object.entries(categorySlugAliases).map(([slug, id]) => [
    slug,
    categoriesById.get(id),
  ]),
].filter(([, category]) => Boolean(category)));

export function getEffectCategory(id) {
  return categoriesById.get(id) || null;
}

export function getEffectCategoryBySlug(slug) {
  return categoriesBySlug.get(slug) || categoriesById.get(slug) || null;
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
  const effectSlug = effect?.effectSlug || effect?.slug || effect?.name;

  if (!effectSlug) return "/effects";

  if (effect?.categorySlug) {
    return `/effects/${effect.categorySlug}/${effectSlug}`;
  }

  const categoryId = effect.categories?.[0] || effect.category || "others";

  const category = getEffectCategory(categoryId);

  const categorySlug = category?.slug || categoryId;

  return `/effects/${categorySlug}/${effectSlug}`;
}

export function getEffectPreviewHref(effect) {
  const effectSlug = effect?.effectSlug || effect?.slug || effect?.name;

  return effectSlug ? `/demo/${effectSlug}` : "/effects";
}
