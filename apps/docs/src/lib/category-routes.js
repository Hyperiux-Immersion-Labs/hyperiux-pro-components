import { getEffectRouteSlug } from "./effect-slugs";

/**
 * Just enough of each effect category to link to it: its id, name, slug and slug aliases,
 * in sidebar order. Client components (search, header, sidebar, effect cards) import this
 * instead of ./categories, which adds each category's page copy, metadata and FAQs (~55 KB)
 * for the server.
 */
export const categoryRoutes = [
  { id: "featured", name: "Featured Components", slug: "featured" },
  { id: "text", name: "Text Animations", slug: "text-animations", aliases: ["text-effects"] },
  { id: "backgrounds", name: "Animated Backgrounds", slug: "backgrounds" },
  { id: "buttons", name: "Animated Buttons", slug: "buttons" },
  { id: "carousels", name: "Carousel Effects", slug: "carousels" },
  { id: "scroll", name: "Scroll Effects", slug: "scroll-effects" },
  { id: "components", name: "Creative Components", slug: "components" },
  { id: "navigation", name: "Navigations", slug: "navigation" },
  { id: "cursor", name: "Cursor Effects", slug: "cursor-effects" },
  { id: "transitions", name: "Page Transitions", slug: "page-transitions" },
  { id: "loaders", name: "Loaders", slug: "loaders", aliases: ["website-loaders"] },
  { id: "webgl", name: "WebGL & 3D Effects", slug: "webgl-effects", aliases: ["webgl"] },
];

// Other slugs a category is reached by
export const CATEGORY_SLUG_ALIASES = {
  featured: "featured",
  "featured-effects": "featured",
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
  other: "components",
  others: "components",
};

const routesById = new Map(categoryRoutes.map((category) => [category.id, category]));
const routesBySlug = new Map(
  [
    ...categoryRoutes.map((category) => [category.slug, category]),
    ...Object.entries(CATEGORY_SLUG_ALIASES).map(([slug, id]) => [slug, routesById.get(id)]),
  ].filter(([, category]) => Boolean(category))
);

export function getEffectCategoryRoute(id) {
  return routesById.get(id) || null;
}

export function getEffectCategoryRouteBySlug(slug) {
  const normalizedSlug = slug?.toString().toLowerCase();

  return routesBySlug.get(normalizedSlug) || routesById.get(normalizedSlug) || null;
}

// Effects sourced from Sanity carry `categorySlug`, which is Sanity's own
// slug field and does NOT always match the canonical short `id` used
// everywhere else (e.g. Sanity's categorySlug is "text-animations" while
// the site-wide id is "text") - resolve through categorySlug first so
// callers always get back the canonical id instead of a raw Sanity slug
// (which would otherwise render as an ugly label like "Scroll-effects").
export function resolveEffectCategoryId(effect) {
  if (effect?.categorySlug) {
    return getEffectCategoryRouteBySlug(effect.categorySlug)?.id || effect.category;
  }

  return effect?.categories?.[0] || effect?.category;
}

// Single source of truth for how a category/filter id reads as a chip label -
// used by the vault listing's category chips + featured/free/pro dropdown,
// and by the Saved Effects / Usage dashboard tabs so the same id never
// renders under two different names. Deliberately a plain capitalize rather
// than each category's full `.name` (e.g. "text" -> "Text", not "Text
// Animations") to keep filter chips compact.
export function getQuickCategoryLabel(id) {
  if (id === "all") return "All";
  if (id === "free") return "Free";
  if (id === "pro") return "Pro";
  if (id === "featured") return "Featured";
  if (id === "webgl") return "WebGL";

  return id.charAt(0).toUpperCase() + id.slice(1);
}

export function getEffectCategoryHref(id) {
  if (id === "all") return "/effects";
  if (id === "pro") return "/effects/pro";

  const category = getEffectCategoryRoute(id);
  return `/effects/${category?.slug || id}`;
}

export function getEffectPrimaryCategory(effect) {
  const categories = effect?.categories?.length
    ? effect.categories
    : [effect?.category || "components"];

  return categories[0] || "components";
}

export function getEffectHref(effect) {
  const effectSlug = getEffectRouteSlug(effect?.effectSlug || effect?.slug || effect?.name);

  if (!effectSlug) return "/effects";

  if (effect?.categorySlug) {
    const category = getEffectCategoryRouteBySlug(effect.categorySlug);
    const categorySlug = category?.slug || effect.categorySlug;

    return `/effects/${categorySlug}/${effectSlug}`;
  }

  const categoryId = effect.categories?.[0] || effect.category || "components";

  const category = getEffectCategoryRoute(categoryId);

  const categorySlug = category?.slug || categoryId;

  return `/effects/${categorySlug}/${effectSlug}`;
}

export function getEffectPreviewHref(effect) {
  const effectSlug = getEffectRouteSlug(effect?.effectSlug || effect?.slug || effect?.name);

  return effectSlug ? `/demo/${effectSlug}` : "/effects";
}
