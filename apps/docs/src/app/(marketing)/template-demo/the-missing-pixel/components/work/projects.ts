// Built using Hyperiux Vault: https://vault.hyperiux.com

import type { StaticImageData } from "next/image";
import cloudline from "../../assets/w-cloudline.webp";
import kickflip from "../../assets/w-kickflip.webp";
import northway from "../../assets/w-northway.webp";
import drift from "../../assets/w-drift.webp";

export type Project = {
  title: string;
  meta: string;
  year: string;
  cats: string[];
  image: StaticImageData;
  alt: string;
  description: string;
};

export const PROJECTS: Project[] = [
  {
    title: "Cloudline",
    meta: "Identity, packaging, launch",
    year: "2026",
    cats: ["branding", "packaging"],
    image: cloudline,
    alt: "Model resting in soft pink clouds",
    description: "Every haircare brand was shouting about science. Cloudline wanted to talk about how it feels. We built the brand, the packs and the launch around one image: hair falling into clouds.",
  },
  {
    title: "Kickflip Supply",
    meta: "Identity, e-commerce",
    year: "2026",
    cats: ["branding", "web"],
    image: kickflip,
    alt: "Skater mid-trick against a concrete wall",
    description: "A skate brand that finally looks like skaters. We built an identity and an online shop with the same loose, sun-bleached energy as a Saturday at the park.",
  },
  {
    title: "Northway Records",
    meta: "Motion identity",
    year: "2025",
    cats: ["motion", "branding"],
    image: northway,
    alt: "Portrait lit by a huge orange sun",
    description: "A label logo that plays along with the music. We built a motion identity that moves to the beat, from the first sleeve to the last stage screen.",
  },
  {
    title: "Drift Campers",
    meta: "Website, booking platform",
    year: "2025",
    cats: ["web"],
    image: drift,
    alt: "Mint camper van on a desert road",
    description: "Bookings doubled and the vans stayed charming. We designed a website and booking platform that feels as easy as pulling up somewhere nice and staying the night.",
  },
  {
    title: "Lumen Mobile",
    meta: "Launch campaign, motion",
    year: "2025",
    cats: ["motion"],
    image: cloudline,
    alt: "Model resting in soft pink clouds",
    description: "A phone launch with actual personality. A new phone brand entering a crowded category, and a launch campaign on a deadline that scared other agencies off.",
  },
  {
    title: "Bloom Hours",
    meta: "Campaign, art direction",
    year: "2024",
    cats: ["branding"],
    image: kickflip,
    alt: "Skater mid-trick against a concrete wall",
    description: "Fragrance photographed like a memory. We art directed a campaign that lets the bottle disappear into the feeling of an hour you wish you could keep.",
  },
  {
    title: "Fieldnote",
    meta: "Editorial design, website",
    year: "2024",
    cats: ["web"],
    image: northway,
    alt: "Portrait lit by a huge orange sun",
    description: "Editorial design and a website for people who write things down. A notebook brand that wanted its pages to feel as good on screen as they do in the hand.",
  },
  {
    title: "Orbit Labs",
    meta: "Brand system, website",
    year: "2024",
    cats: ["web", "branding"],
    image: drift,
    alt: "Mint camper van on a desert road",
    description: "A brand system and website for a team building quietly serious things. Warm, rounded and orbiting one idea: make complicated work feel approachable.",
  },
];
