export const FEATURED_EFFECT_SLUGS = [
  "circular-split-roll",
  "spider-particles",
  "animated-toggle",
  "ring-carousel",
  "animated-tabs",
  "colorful-cursor-aura",
  "stack-loader",
  "side-navbar",
  "circle-text-reveal",
  "chess-grid-transition",
  "3d-portfolio-slider",
  "draggable-marquee",
  "dither-canvas",
  "link-button",
  "infinite-carousel",
  "animated-modal",
  "magnetic-image-trail",
  "lines-loader",
  "immersive-full-screen-nav",
  "focus-text",
  "svg-brush-transition",
  "progressive-bloom-valley",
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
