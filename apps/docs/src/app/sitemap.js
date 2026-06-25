import { TECHNOLOGIES } from "@/components/Tech/tech-data";
import { getEffectCategoryBySlug, getEffectHref } from "@/lib/categories";
import { getRegistryIndex, getEffectsByCategory } from "@/lib/registry";
import { applySanityCategorySlugs, getAllSanityEffectEntries } from "@/lib/sanity";
import { homepage } from "@/lib/util";

const staticRoutes = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/effects", changeFrequency: "daily", priority: 0.9 },
  { path: "/effects/featured", changeFrequency: "weekly", priority: 0.8 },
  { path: "/effects/free", changeFrequency: "weekly", priority: 0.8 },
  { path: "/tech", changeFrequency: "monthly", priority: 0.7 },
  { path: "/pricing", changeFrequency: "monthly", priority: 0.7 },
  { path: "/free-tier", changeFrequency: "monthly", priority: 0.7 },
  { path: "/docs", changeFrequency: "monthly", priority: 0.7 },
  { path: "/docs/installation", changeFrequency: "monthly", priority: 0.6 },
  { path: "/docs/cli", changeFrequency: "monthly", priority: 0.6 },
  { path: "/docs/dependencies", changeFrequency: "monthly", priority: 0.6 },
  { path: "/docs/license", changeFrequency: "yearly", priority: 0.5 },
];

function toSitemapEntry({ path, changeFrequency, priority }) {
  return {
    url: new URL(path, homepage).toString(),
    changeFrequency,
    priority,
  };
}

export default async function sitemap() {
  const registry = getRegistryIndex();
  const sanityEntries = await getAllSanityEffectEntries();
  const effects = applySanityCategorySlugs(registry.items, sanityEntries);

  const categoryRoutes = Object.keys(getEffectsByCategory()).map((categorySlug) => {
    const category = getEffectCategoryBySlug(categorySlug);

    return {
      path: `/effects/${category?.slug || categorySlug}`,
      changeFrequency: "weekly",
      priority: 0.7,
    };
  });

  const effectRoutes = effects.map((effect) => ({
    path: getEffectHref(effect),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const demoRoutes = sanityEntries.map((entry) => ({
    path: `/demo/${entry.effectSlug}`,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const technologyRoutes = TECHNOLOGIES.map((technology) => ({
    path: `/tech/${technology.slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const routes = [
    ...staticRoutes,
    ...categoryRoutes,
    ...effectRoutes,
    ...demoRoutes,
    ...technologyRoutes,
  ];

  return [...new Map(routes.map((route) => [route.path, route])).values()].map(
    toSitemapEntry
  );
}
