// Effect health for the admin Effects tab: every way an effect's Sanity guide and its
// registry entry disagree, or its guide is incomplete - so content can be fixed from a
// list instead of reading 150 pages. Pure (tested in effect-health.test.js); the route
// feeds it the registry, the raw Sanity guides and the built AI catalogue.

import { INTERNAL_NOTE, checkEffect } from "./ai-catalogue-checks";
import { getEffectCategoryBySlug } from "./categories";
import { getEffectRouteSlug } from "./effect-slugs";

export const HEALTH_KINDS = {
  "no-guide": { severity: "high", label: "No Sanity guide" },
  "orphan-guide": { severity: "high", label: "Guide without an effect" },
  "category-mismatch": { severity: "high", label: "Category differs" },
  "internal-note": { severity: "high", label: "Internal note in copy" },
  "import-path": { severity: "high", label: "Wrong import path" },
  "usage-import": { severity: "high", label: "Usage imports a missing package" },
  "undocumented-prop": { severity: "medium", label: "Undocumented prop in usage" },
  "prop-type": { severity: "medium", label: "Prop type mismatch" },
  "no-text-prop": { severity: "medium", label: "Text can't be set" },
  "no-usage": { severity: "medium", label: "No usage example" },
  whitespace: { severity: "low", label: "Stray spaces" },
  "related-missing": { severity: "low", label: "Related effect not found" },
  "no-seo": { severity: "low", label: "No SEO description" },
};
const SEVERITY_ORDER = { high: 0, medium: 1, low: 2 };

const routeSlug = (value) => getEffectRouteSlug(value) || value;
// How the effect page matches a related-effect name ([effectSlug]/page.js normalize):
// against an effect's title, name or slug
const normalize = (value = "") => value.toString().toLowerCase().trim().replace(/&/g, "and").replace(/\s+/g, "-");
const categorySlugOf = (value) => getEffectCategoryBySlug(value)?.slug || value || null;

/**
 * registryItems - public/r/index.json items ({ name, category, tier, ... })
 * guides        - Sanity effectContent docs, raw ({ _id, effectSlug, categorySlug, title,
 *                 summary, seoDescription, body: [{ _type, style, text, code }], relatedEffectNames })
 * catalogue     - the built AI catalogue (lib/ai-catalogue), for the usage / props checks
 * Returns { effects: [{ slug, title, categorySlug, tier, sanityId, docsUrl, issues }], counts }
 * - only effects with at least one issue, worst first.
 */
export function computeEffectHealth({ registryItems = [], guides = [], catalogue = { effects: [] } }) {
  const guideBySlug = new Map(guides.map((guide) => [routeSlug(guide.effectSlug), guide]));
  const registrySlugs = new Set(registryItems.map((item) => routeSlug(item.name)));
  const catalogueBySlug = new Map((catalogue.effects || []).map((effect) => [effect.slug, effect]));
  const knownNames = new Set(
    [...(catalogue.effects || []).flatMap((effect) => [effect.title, effect.slug]), ...registryItems.map((item) => item.name)].filter(Boolean).map(normalize)
  );

  const results = [];
  const add = (entry, kind, message) => entry.issues.push({ kind, severity: HEALTH_KINDS[kind].severity, message });

  for (const item of registryItems) {
    const slug = routeSlug(item.name);
    const guide = guideBySlug.get(slug);
    const built = catalogueBySlug.get(item.name);
    const registryCategory = categorySlugOf(item.category);
    const entry = {
      slug: item.name,
      title: String(guide?.title || built?.title || item.name).trim(),
      categorySlug: registryCategory,
      tier: item.tier === "pro" ? "pro" : "free",
      sanityId: guide?._id || null,
      docsUrl: `/effects/${registryCategory}/${slug}`,
      issues: [],
    };

    if (!guide) {
      add(entry, "no-guide", "No Sanity guide: its page shows only the registry's title and description.");
    } else {
      const guideCategory = categorySlugOf(guide.categorySlug);
      if (guideCategory && guideCategory !== registryCategory) {
        add(entry, "category-mismatch", `Sanity files it under ${guideCategory}, the registry under ${registryCategory}.`);
      }
      // Raw guide copy (the catalogue strips these before publishing, the effect page doesn't)
      const texts = [guide.title, guide.summary, guide.seoDescription, ...(guide.body || []).map((block) => block?.text)].filter(Boolean);
      if (texts.some((text) => INTERNAL_NOTE.test(text))) add(entry, "internal-note", "Contains the internal “verify the shipped component API” note.");
      for (const [field, value] of [["Title", guide.title], ["Summary", guide.summary]]) {
        if (typeof value === "string" && (value !== value.trim() || /\\n/.test(value))) add(entry, "whitespace", `${field} has stray spaces or a \\n.`);
      }
      if (!guide.seoDescription?.trim()) add(entry, "no-seo", "No SEO description.");
      for (const name of guide.relatedEffectNames || []) {
        if (!knownNames.has(normalize(name))) add(entry, "related-missing", `Related effect “${name}” matches no effect, so its page doesn’t link it.`);
      }
    }

    // Usage example vs the registry (dependencies, documented props, install path)
    if (built) {
      for (const issue of checkEffect(built)) {
        if (issue.kind === "internal-note" || issue.kind === "whitespace") continue; // checked on the raw guide above
        if (HEALTH_KINDS[issue.kind]) add(entry, issue.kind, issue.message);
      }
    }

    if (entry.issues.length) results.push(entry);
  }

  // Guides with no effect behind them
  for (const guide of guides) {
    if (registrySlugs.has(routeSlug(guide.effectSlug))) continue;
    const entry = {
      slug: guide.effectSlug,
      title: String(guide.title || guide.effectSlug).trim(),
      categorySlug: categorySlugOf(guide.categorySlug),
      tier: null,
      sanityId: guide._id || null,
      docsUrl: null,
      issues: [],
    };
    add(entry, "orphan-guide", "A Sanity guide whose effect isn't in the registry - renamed or removed?");
    results.push(entry);
  }

  const worst = (entry) => Math.min(...entry.issues.map((issue) => SEVERITY_ORDER[issue.severity]));
  results.sort((a, b) => worst(a) - worst(b) || b.issues.length - a.issues.length || a.title.localeCompare(b.title));
  for (const entry of results) entry.issues.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);

  const counts = {};
  for (const entry of results) for (const issue of entry.issues) counts[issue.kind] = (counts[issue.kind] || 0) + 1;

  return { effects: results, counts, total: registryItems.length };
}
