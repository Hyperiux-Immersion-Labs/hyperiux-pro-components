const effectSlugAliasGroups = [
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
];

const effectSlugAliasMap = new Map(
  effectSlugAliasGroups.flatMap((group) =>
    [group.slug, ...group.aliases].map((slug) => [slug, group])
  )
);

export function getEffectRouteSlug(slug) {
  const normalizedSlug = slug?.toString().toLowerCase();
  const group = effectSlugAliasMap.get(normalizedSlug);

  return group?.slug || normalizedSlug || slug;
}

export function getEffectSlugAliases(slug) {
  const normalizedSlug = slug?.toString().toLowerCase();
  const group = effectSlugAliasMap.get(normalizedSlug);

  return [
    group?.slug,
    ...(group?.aliases || []),
    normalizedSlug,
    slug,
  ].filter((value, index, values) => value && values.indexOf(value) === index);
}
