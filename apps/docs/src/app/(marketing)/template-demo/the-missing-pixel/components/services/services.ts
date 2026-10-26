// Built using Hyperiux Vault: https://vault.hyperiux.com

import type { StaticImageData } from "next/image";
import strategy from "../../assets/pictures/s-strategy.webp";
import identity from "../../assets/pictures/s-identity.webp";
import web from "../../assets/pictures/s-web.webp";
import motion from "../../assets/pictures/s-motion.webp";
import packaging from "../../assets/pictures/s-packaging.webp";
import content from "../../assets/pictures/s-content.webp";

export type Service = {
  slug: string;
  title: string;
  text: string;
  description: string;
  tags: string[];
  image: StaticImageData;
};

export const SERVICES: Service[] = [
  {
    slug: "brand-strategy",
    title: "Brand strategy",
    text: "Positioning, naming and messaging that make your whole company sound like one person.",
    description:
      "Positioning, naming and messaging that make your whole company sound like one person, built from real conversations instead of guesses.",
    tags: ["Research", "Positioning", "Naming", "Messaging", "Tone of voice"],
    image: strategy,
  },
  {
    slug: "brand-identity",
    title: "Brand identity",
    text: "Logos, type and systems that look just as sharp on a billboard as on a favicon.",
    description:
      "A complete identity, from the first conversation to the last guideline, built to work everywhere your brand turns up.",
    tags: ["Logo systems", "Visual language", "Guidelines", "Toolkits"],
    image: identity,
  },
  {
    slug: "websites-and-products",
    title: "Websites and products",
    text: "Fast, accessible sites and products, designed and engineered under one roof.",
    description:
      "Fast, accessible sites and products, designed and engineered under one roof, so what we design is exactly what ships.",
    tags: [
      "UX and UI",
      "Webflow and custom",
      "Design systems",
      "Accessibility",
    ],
    image: web,
  },
  {
    slug: "motion-and-3d",
    title: "Motion and 3D",
    text: "Identities that move, launch films and product visuals people actually replay.",
    description:
      "Identities that move, launch films and product visuals people actually replay, made by the same team that designed the brand.",
    tags: ["Motion identity", "Launch films", "3D product", "UI motion"],
    image: motion,
  },
  {
    slug: "packaging",
    title: "Packaging",
    text: "Packs that win the shelf, then earn a second life on someone’s bookcase.",
    description:
      "Packs that win the shelf, then earn a second life on someone’s bookcase, from structure and range to the print file.",
    tags: ["Structure", "Range architecture", "Production", "Sustainability"],
    image: packaging,
  },
  {
    slug: "content-and-campaigns",
    title: "Content and campaigns",
    text: "Launches and social systems with something to say, and the nerve to say it.",
    description:
      "Launches and social systems with something to say, and the nerve to say it, from the big idea to the last post.",
    tags: ["Campaign ideas", "Social systems", "Art direction", "Copywriting"],
    image: content,
  },
];

export const DETAIL = {
  image: identity,
  alt: "A sculpted sage-green ampersand on a round plinth",
  facts: [
    { label: "Timeline", value: "8 to 12 weeks" },
    { label: "From", value: "$18,000" },
    { label: "Team", value: "4 to 6 seniors" },
    { label: "Best for", value: "New brands and rebrands" },
  ],
  overview: [
    "People judge your brand before they read a word. We make sure the first impression is the right one, and that it survives the second, third and hundredth.",
    "Every project starts with strategy, because no logo can rescue a muddled story. Once we know what you stand for, we design a system that says it everywhere, from a favicon to a trade-show stand.",
  ],
  outcomes: [
    "A positioning your whole team can say in one breath",
    "A visual system that works from favicon to billboard",
    "Guidelines and templates people actually open",
    "Full ownership of every file and font licence",
  ],
  fit: [
    {
      title: "Startups before launch",
      text: "You have a product and a name. You need to look like you’ve been here for years by Tuesday.",
    },
    {
      title: "Companies that outgrew their look",
      text: "Your brand was built for the company you were five years ago. It shows.",
    },
    {
      title: "Brands after a merger",
      text: "Two identities, one company. You need a system that respects both and belongs to neither.",
    },
  ],
  deliverables: [
    {
      title: "Strategy",
      items: [
        "Brand and competitor audit",
        "Customer interviews",
        "Positioning and brand idea",
        "Personality and tone of voice",
        "Messaging framework",
      ],
    },
    {
      title: "Identity",
      items: [
        "Logo and wordmark system",
        "Accessible colour palette",
        "Typography, licensed to you",
        "Graphic language and patterns",
        "Photography and illustration direction",
        "Icon set",
      ],
    },
    {
      title: "Rollout",
      items: [
        "Online brand guidelines",
        "Social, deck and document templates",
        "Stationery and email signatures",
        "Organised asset library",
        "Animated logo",
        "Two weeks of launch support",
      ],
    },
  ],
  approach:
    "Five phases. Each ends with a decision you sign off, so nothing moves forward on a maybe.",
  phases: [
    {
      title: "Discovery",
      time: "Weeks 1 to 2",
      text: "We interview your leadership, your customers and your front line, audit everything you have and map the competition.",
      output: ["Research summary", "Audit deck"],
    },
    {
      title: "Strategy",
      time: "Weeks 2 to 3",
      text: "One workshop to agree the positioning, the personality and the single idea the brand stands on.",
      output: ["Positioning statement", "Creative brief"],
    },
    {
      title: "Concepts",
      time: "Weeks 4 to 6",
      text: "Two or three genuinely different routes, each shown on real touchpoints instead of a mood board.",
      output: ["Concept presentation", "Recorded walkthrough"],
    },
    {
      title: "Refinement",
      time: "Weeks 7 to 9",
      text: "We build the chosen route into a full system and try to break it with your hardest use cases.",
      output: ["Full identity system", "Two review rounds"],
    },
    {
      title: "Delivery",
      time: "Weeks 10 to 12",
      text: "Guidelines, templates and files handed over live, then two weeks of support while you launch.",
      output: ["Guidelines site", "Asset library"],
    },
  ],
  need: [
    "A decision maker in every review",
    "Two or three customers we can interview",
    "Your current brand files and any research",
    "Feedback within three working days",
  ],
  included: [
    "Weekly check-ins and a shared project board",
    "Source files in Figma and Adobe formats",
    "Full copyright transfer on final payment",
    "Font licences for up to 50 users",
  ],
  tools: [
    "Figma",
    "Illustrator",
    "After Effects",
    "Cinema 4D",
    "Glyphs",
    "Notion",
  ],
  workTitles: ["Cloudline", "Orbit Labs"],
  faq: [
    {
      question: "How long does an identity take?",
      answer:
        "Eight to twelve weeks for most projects. Multi-market flagships can run to sixteen.",
    },
    {
      question: "Do we own everything at the end?",
      answer:
        "Yes. Copyright transfers on final payment, and fonts are licensed in your company’s name.",
    },
    {
      question: "How many concepts will we see?",
      answer:
        "Two or three, depending on the tier. Each is a genuine alternative, not one idea in three outfits.",
    },
    {
      question: "What if we hate all of them?",
      answer:
        "Rare, because strategy is agreed first. If it happens, we run a second round at no extra cost.",
    },
    {
      question: "Can you work with our in-house designers?",
      answer:
        "Gladly. We often set the system and then train your team to run it.",
    },
    {
      question: "How do payments work?",
      answer:
        "40% to start, 30% when you approve a concept, 30% on delivery. Retainers are billed monthly in advance.",
    },
  ],
};
