import { getEffectRouteSlug } from "./effect-slugs";

export const effectCategories = [
  {
    id: "featured",
    name: "Featured",
    slug: "featured",
    description: "A curated mix of standout free and pro effects picked to show the range, polish, and motion quality inside the Hyperiux vault.",
    faqs: [
      {
        question: "How are featured effects chosen?",
        answer: "Featured effects are hand-picked from both free and pro items to show the range of motion, interaction, and visual polish available in the vault.",
      },
      {
        question: "What does the featured collection include?",
        answer: "It includes a balanced selection of free and pro effects across categories like scroll, WebGL, text, and interaction so visitors can quickly sample the vault’s range.",
      },
    ],
  },
  {
    id: "text",
    name: "Text",
    slug: "text-animations",
    aliases: ["text-effects"],
    description: "Text animation should make important words arrive with intent, not turn paragraphs into a slot machine. These effects are for hero headlines, section intros, launch moments, one-word highlights and short statements that deserve timing. The text remains real DOM text for search and assistive technology, with motion layered above it. Under reduced motion, the final readable state appears immediately because legibility is the product here.",
    faqs: [
      {
        question: "Are text animations bad for SEO?",
        answer: "No, if the final text exists as real HTML and is not replaced by canvas-only glyphs. Search engines and screen readers should see the words, not the choreography.",
      },
      {
        question: "Can I animate body copy?",
        answer: "Avoid it. Animate headlines, labels and short statements. Long animated paragraphs slow reading and make the page feel like it is narrating itself with jazz hands.",
      },
      {
        question: "How do I avoid layout shift with split text?",
        answer: "Reserve the final text space before characters animate, avoid changing font metrics during the reveal and keep the final readable text in normal document flow.",
      }
    ],
  },
  {
    id: "backgrounds",
    name: "Backgrounds",
    slug: "backgrounds",
    description: "A background should set the tone and then stop auditioning for the lead role. These effects give product and brand pages an engineered surface without leaning on slow video or stock gradients: a crisp dotted grid, a light particle field or a dithered canvas texture. Dotted Grid is the safest default because it can ship CSS-only with no dependency cost. Spider Particles and Dither Canvas add movement and texture when the hero needs atmosphere, but both should reduce density or pause on smaller devices.",
    faqs: [
      {
        question: "How do I keep animated backgrounds readable behind text?",
        answer: "Keep contrast high, fade density behind headlines and CTAs, and test the actual text sitting above the effect, not an empty preview canvas.",
      },
      {
        question: "Which background is safest for performance?",
        answer: "Dotted Grid. It can run as CSS with no animation library. Canvas backgrounds should cap particle count, pause offscreen and reduce density on mobile.",
      },
      {
        question: "Should background animation stop when the section is offscreen?",
        answer: "Yes for canvas or particle effects. Use IntersectionObserver or page visibility checks so the browser is not busy animating a section nobody can see. Hero backgrounds are not a gym membership; no need to pay for what you are not using.",
      }
    ],
  },
  {
    id: "buttons",
    name: "Buttons",
    slug: "buttons",
    description: "Buttons do not need drama. They need feedback. These microinteractions make CTAs feel responsive without slowing the action: letters stagger, arrows fill, dots expand, labels scramble and toggles verify state. The markup stays honest: real buttons for actions, anchors for navigation, visible focus states and reduced-motion states that still look finished. A clever hover that breaks keyboard use is not craft; it is garnish with a legal department.",
    faqs: [
      {
        question: "Should animated buttons still use normal button and anchor elements?",
        answer: "Yes. Use a button for actions and an anchor for navigation. Do not change semantics because the hover effect looks clever.",
      },
      {
        question: "How should animated buttons behave on keyboard focus?",
        answer: "Show a visible focus-visible state and do not rely on hover-only animation. Keyboard users should get a clear target and an instant activation path.",
      },
      {
        question: "What about loading and disabled states?",
        answer: "Give them explicit states. Loading should announce itself where needed; disabled should look disabled and be programmatically unavailable.",
      }
    ],
  },
  {
    id: "carousels",
    name: "Carousels",
    slug: "carousels",
    description: "Most carousels hide important content and then act surprised when nobody reads it. These two are for equal-weight visual browsing, not mandatory information: a Clip Path Slider where the reveal shape is part of the design, and a Zoom Slider where the active slide moves forward with controlled depth. Controls remain visible, keyboard navigation works, swipe is supported on touch and autoplay pauses when the visitor interacts.",
    faqs: [
      {
        question: "Should a carousel autoplay?",
        answer: "Only if it pauses on hover, focus, touch interaction and reduced motion. Autoplay is decoration; user control is the feature.",
      },
      {
        question: "What accessibility controls are required?",
        answer: "Visible previous/next controls, keyboard arrow support, swipe on touch, focus management and aria-live announcements for the current slide.",
      },
      {
        question: "When should I use a grid instead of a carousel?",
        answer: "Use a grid when the content is important, comparative, long-form or search-relevant. Carousels are for browsable, equal-weight visuals.",
      }
    ],
  },
  {
    id: "scroll",
    name: "Scroll",
    slug: "scroll-effects",
    description: "Scroll is the one interaction every visitor performs, which makes it the most useful place to add rhythm and the easiest place to overdo it. These effects turn a flat page into a sequenced experience: sections pin and hand off, galleries drift at different speeds, horizontal acts sit inside vertical journeys, and portfolio cards rotate through shallow depth. Use them when the content already has a story: a SaaS feature sequence, an agency process, a case study, a product tour or a portfolio reel. Do not use them as confetti for a page with no pacing problem.",
    faqs: [
      {
        question: "Which scroll effect should I use for a SaaS feature section?",
        answer: "Start with Sticky Content Wrapper or Scroll Stack. They keep the explanation structured, preserve reading order and make each feature feel like a deliberate step rather than another card in a queue.",
      },
      {
        question: "When should I avoid scroll animation?",
        answer: "Avoid it when users need to scan quickly, compare dense information, complete a form or reach a CTA without theatre. Scroll should pace the story, not demand rent from the visitor’s wrist.",
      },
      {
        question: "What is the safest mobile fallback?",
        answer: "Collapse pinned, horizontal and perspective effects into vertical sections, native swipe or static cards. Forcing desktop pinning onto touch usually produces the sort of experience that makes people mutter at glass.",
      }
    ],
  },
  {
    id: "components",
    name: "Components",
    slug: "components",
    description: "This is the conversion category. These components are not here to sparkle. They answer objections, collect leads, organize product depth, reveal proof and help users take the next step. Animated FAQ, Form, Tabs and Modal are especially production-sensitive because they touch revenue and accessibility at the same time. The interaction should make the component easier to use, not more dramatic to watch.",
    faqs: [
      {
        question: "Which component should I ship first on a SaaS landing page?",
        answer: "Animated FAQ and Form. One removes objections near the CTA, the other captures demand. Shocking, yes: the revenue bits matter.",
      },
      {
        question: "What accessibility details are non-negotiable?",
        answer: "Correct roles, labels, keyboard support, visible focus, focus trap/restore for dialogs and aria-expanded/controls for accordions.",
      },
      {
        question: "How should conversion components use animation?",
        answer: "Use it to verify state, guide attention or reveal supporting content. Do not let animation delay validation, form submission, focus movement or a purchase decision.",
      }
    ],
  },
  {
    id: "navigation",
    name: "Navigation",
    slug: "navigation",
    description: "Navigation is the riskiest place to be clever because every visitor needs it. These effects give a site spatial presence without stealing reliability: a directional menu that responds to pointer entry, a full-screen overlay for immersive sites, a navbar that elevates as the page scrolls and an expanding compact header. Each one needs keyboard operation, aria-expanded states, focus trap and restore where appropriate, Esc to close and a touch-first drawer or accordion fallback.",
    faqs: [
      {
        question: "Can animated navigation still be accessible?",
        answer: "Yes, if the menu works before animation is added: real links, keyboard movement, visible focus, aria-expanded, Esc to close and focus returned to the trigger.",
      },
      {
        question: "What should happen on mobile?",
        answer: "Use a plain drawer or accordion. Desktop hover menus translated onto touch screens are where good intentions go to develop trust issues.",
      },
      {
        question: "When is a directional menu worth it?",
        answer: "When the site has enough navigation depth to justify panels: services, products, resources, docs, use cases or portfolios. For a three-link nav, keep it boring and fast.",
      }
    ],
  },
  {
    id: "cursor",
    name: "Cursor",
    slug: "cursor-effects",
    description: "A custom cursor can make a homepage feel made-on-purpose within the first mouse movement. It can also make a product UI feel like someone glued a party hat to a spreadsheet. These effects are for creative homepages, portfolios, campaign pages and brand-led experiments where the pointer can become part of the atmosphere: a glass lens, an image trail, a pixel bloom, a rope, a ripple or a small typographic trail. They are not for checkout, admin tools, docs or dense dashboards.",
    faqs: [
      {
        question: "Do cursor effects work on mobile?",
        answer: "No. There is no persistent pointer on touch devices, so every cursor effect should disable itself on coarse pointers and return the normal touch experience.",
      },
      {
        question: "Will a custom cursor hurt usability?",
        answer: "It will if it hides click intent. Keep the native cursor visible or preserve the same meaning, avoid covering focus rings and links, and never let a trail sit above modals, menus or primary CTAs.",
      },
      {
        question: "Which cursor effect is safest for a portfolio homepage?",
        answer: "Liquid Glass Cursor and Magnetic Image Trail are the safest starting points: one adds tactile atmosphere, the other turns movement into a preview of the work.",
      }
    ],
  },
  {
    id: "transitions",
    name: "Page Transitions",
    slug: "page-transitions",
    description: "A route change is a free cut between scenes. Most sites spend it on a hard jump. These transitions turn navigation into a branded moment: pixels dissolve, blocks sweep, SVG lines draw, pages flip, grids close and open. The important rule is simple: the transition should decorate navigation, not delay it. Every transition needs a short duration, route-state wiring, a fade fallback and an instant path for reduced motion.",
    faqs: [
      {
        question: "Do these work with the Next.js App Router?",
        answer: "Yes, but the implementation should be explicit about template/layout boundaries, route state and when the enter animation begins. Do not hide route changes behind a timer and hope for the best.",
      },
      {
        question: "How long should a page transition last?",
        answer: "Usually 300-600ms. Longer than that and it starts feeling like a toll booth between pages.",
      },
      {
        question: "What is the reduced-motion fallback?",
        answer: "Use an instant route change or a simple opacity fade. The destination should become interactive immediately.",
      }
    ],
  },
  {
    id: "loaders",
    name: "Loaders",
    slug: "loaders",
    aliases: ["website-loaders"],
    description: "A loader is an apology for a wait. The best one is honest and brief; the worst one is theatre with a progress bar. These three cover determinate loading, indeterminate waiting and short route/asset transitions. Use them when something genuinely takes time: asset loading, upload progress, WebGL warm-up or route transition. If the page is already fast, do not add a fake preloader. Congratulations, you have won the loading problem. Stop inventing it.",
    faqs: [
      {
        question: "Should Numeric Tunnel show real progress?",
        answer: "Yes. Tie it to asset, upload or warm-up progress. A fake number that reaches 100 before content appears teaches users not to believe the interface.",
      },
      {
        question: "How should loaders be announced to assistive technology?",
        answer: "Use aria-busy on the loading region and an appropriate live region for status text when the change matters. Do not spam announcements on every animation frame.",
      },
      {
        question: "When is a skeleton better than a loader?",
        answer: "When the layout is known and content will stream in place. Skeletons usually feel faster because they show where the page is going.",
      }
    ],
  },
  {
    id: "webgl",
    name: "WebGL",
    slug: "webgl-effects",
    aliases: ["webgl"],
    description: "This is the proof-of-craft category. It also has the most ways to set a laptop on spiritual fire. These effects bring real GPU work to the page: glass shaders, bloom scenes, grid tunnels, curved planes, pixelation and draggable canvases. Use them for premium heroes, AI/product launches, creative portfolios and immersive brand work where the visual payoff justifies the cost. Every page needs a budget: capped DPR, paused render loops, limited postprocessing, controlled texture sizes, reduced mobile quality and a static poster fallback.",
    faqs: [
      {
        question: "Will WebGL slow down the site?",
        answer: "It can if shipped raw. Cap DPR around 1.5, pause render loops offscreen and when the tab is hidden, reduce postprocessing and use poster fallbacks.",
      },
      {
        question: "What dependencies do these effects need?",
        answer: "Most use Three.js, React Three Fiber, Drei and sometimes postprocessing. Canvas-based variants should say so explicitly. Each effect page lists its exact stack.",
      },
      {
        question: "How should WebGL behave on mobile?",
        answer: "Reduce quality, lower texture size, disable bloom-heavy passes and switch to a poster when the device cannot justify the scene.",
      }
    ],
  },
  {
    id: "others",
    name: "Others",
    slug: "others",
    description: "Experimental and utility effects that do not fit neatly into one bucket, but still bring a strong visual or interaction idea.",
    faqs: [
      {
        question: "What goes into the Others category?",
        answer: "Effects that are useful or visually strong but do not fit cleanly into one of the main buckets live here.",
      },
      {
        question: "Should I check this category for experiments?",
        answer: "Yes. This is where more unusual interaction ideas and utility-style effects can appear before they become their own category.",
      },
    ],
  },
];

const categoriesById = new Map(effectCategories.map((category) => [category.id, category]));
const categorySlugAliases = {
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
