const effectSlugAliasGroups = [
  {
    slug: "hyperiux-glitter",
    aliases: ["hyperiux-glitter-concept"],
  },
  {
    slug: "immersive-full-screen-nav",
    aliases: ["immersive-full-screen-navigation"],
  },
  {
    slug: "char-stagger-button",
    aliases: ["character-stagger-button"],
  },
  {
    slug: "char-stagger-primary-button",
    aliases: ["character-stagger-primary-button"],
  },
  {
    slug: "clippath-slider",
    aliases: ["clip-path-slider"],
  },
  { slug: "text-hover", aliases: ["text-hover-expand"] },
  { slug: "svg-path", aliases: ["svg-path-marquee"] },
];

const effectSlugAliasMap = new Map(
  effectSlugAliasGroups.flatMap((group) =>
    [group.slug, ...group.aliases].map((slug) => [slug, group])
  )
);

function normalizeSlug(slug) {
  if (!slug) return slug;

  let normalizedSlug = slug.toString().trim().toLowerCase();

  try {
    normalizedSlug = decodeURIComponent(normalizedSlug);
  } catch {
    return normalizedSlug;
  }

  return normalizedSlug
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getEffectRouteSlug(slug) {
  const normalizedSlug = normalizeSlug(slug);
  const group = effectSlugAliasMap.get(normalizedSlug);

  return group?.slug || normalizedSlug || slug;
}

export function getEffectSlugAliases(slug) {
  const normalizedSlug = normalizeSlug(slug);
  const group = effectSlugAliasMap.get(normalizedSlug);

  return [
    group?.slug,
    ...(group?.aliases || []),
    normalizedSlug,
    slug,
  ].filter((value, index, values) => value && values.indexOf(value) === index);
}
