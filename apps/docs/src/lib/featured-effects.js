export const FEATURED_EFFECT_SLUGS = [
  "circular-split-roll",
  "draggable-marquee",
  "horizontal-feature-reveal",
  "grid-scale",
  "infinite-perspective-slider",
  "helix-slider",
  "parallax-slider",
  "inertia-scroll-effect",
  "rotation-slider",
  "parallax-footer",
  "scroll-distortion",
  "parallax-gallery",
  "sticky-content-wrapper",
  "parallax-image",
  "text-convergence",
];

export function getFeaturedEffects(effects = []) {
  const effectsBySlug = new Map(effects.map((effect) => [effect.name, effect]));

  return FEATURED_EFFECT_SLUGS
    .map((slug) => effectsBySlug.get(slug))
    .filter(Boolean);
}

export function isFeaturedEffect(effect, effects = []) {
  return getFeaturedEffects(effects).some(
    (featuredEffect) => featuredEffect.name === effect?.name,
  );
}
