// Built using Hyperiux Vault: https://vault.hyperiux.com

import type { StaticImageData } from "next/image";
import cloudline from "../../assets/pictures/w-cloudline.webp";
import kickflip from "../../assets/pictures/w-kickflip.webp";
import northway from "../../assets/pictures/w-northway.webp";
import drift from "../../assets/pictures/w-drift.webp";
import lumen from "../../assets/pictures/w-lumen.webp";
import bloom from "../../assets/pictures/w-bloom.webp";
import fieldnote from "../../assets/pictures/w-fieldnote.webp";
import orbit from "../../assets/pictures/w-orbit.webp";
import cloudlineGallery1 from "../../assets/pictures/wd-cloudline-1.webp";
import cloudlineGallery2 from "../../assets/pictures/wd-cloudline-2.webp";
import cloudlineGallery3 from "../../assets/pictures/wd-cloudline-3.webp";
import cloudlineGallery4 from "../../assets/pictures/wd-cloudline-4.webp";
import kickflipGallery1 from "../../assets/pictures/wd-kickflip-1.webp";
import kickflipGallery2 from "../../assets/pictures/wd-kickflip-2.webp";
import kickflipGallery3 from "../../assets/pictures/wd-kickflip-3.webp";
import kickflipGallery4 from "../../assets/pictures/wd-kickflip-4.webp";
import northwayGallery1 from "../../assets/pictures/wd-northway-1.webp";
import northwayGallery2 from "../../assets/pictures/wd-northway-2.webp";
import northwayGallery3 from "../../assets/pictures/wd-northway-3.webp";
import northwayGallery4 from "../../assets/pictures/wd-northway-4.webp";
import driftGallery1 from "../../assets/pictures/wd-drift-1.webp";
import driftGallery2 from "../../assets/pictures/wd-drift-2.webp";
import driftGallery3 from "../../assets/pictures/wd-drift-3.webp";
import driftGallery4 from "../../assets/pictures/wd-drift-4.webp";
import lumenGallery1 from "../../assets/pictures/wd-lumen-1.webp";
import lumenGallery2 from "../../assets/pictures/wd-lumen-2.webp";
import lumenGallery3 from "../../assets/pictures/wd-lumen-3.webp";
import lumenGallery4 from "../../assets/pictures/wd-lumen-4.webp";
import bloomGallery1 from "../../assets/pictures/wd-bloom-1.webp";
import bloomGallery2 from "../../assets/pictures/wd-bloom-2.webp";
import bloomGallery3 from "../../assets/pictures/wd-bloom-3.webp";
import bloomGallery4 from "../../assets/pictures/wd-bloom-4.webp";
import fieldnoteGallery1 from "../../assets/pictures/wd-fieldnote-1.webp";
import fieldnoteGallery2 from "../../assets/pictures/wd-fieldnote-2.webp";
import fieldnoteGallery3 from "../../assets/pictures/wd-fieldnote-3.webp";
import fieldnoteGallery4 from "../../assets/pictures/wd-fieldnote-4.webp";
import orbitGallery1 from "../../assets/pictures/wd-orbit-1.webp";
import orbitGallery2 from "../../assets/pictures/wd-orbit-2.webp";
import orbitGallery3 from "../../assets/pictures/wd-orbit-3.webp";
import orbitGallery4 from "../../assets/pictures/wd-orbit-4.webp";

export type Project = {
  title: string;
  meta: string;
  year: string;
  cats: string[];
  image: StaticImageData;
  alt: string;
  gallery: { image: StaticImageData; alt: string }[];
  description: string;
};

export const PROJECTS: Project[] = [
  {
    title: "Cloudline",
    meta: "Identity, packaging, launch",
    year: "2026",
    cats: ["branding", "packaging"],
    image: cloudline,
    alt: "A lilac Cloudline bottle on a pastel podium",
    gallery: [
      { image: cloudlineGallery1, alt: "The Cloudline range on a long lilac plinth: pump bottle, tube and jar" },
      { image: cloudlineGallery2, alt: "A Cloudline pump bottle resting on soft white clouds" },
      { image: cloudlineGallery3, alt: "Two Cloudline tubes standing on their caps beside an open jar of cream" },
      { image: cloudlineGallery4, alt: "The rounded Cloudline wordmark rising out of soft clouds" },
    ],
    description: "Every haircare brand was shouting about science. Cloudline wanted to talk about how it feels. We built the brand, the packs and the launch around one image: hair falling into clouds.",
  },
  {
    title: "Kickflip Supply",
    meta: "Identity, e-commerce",
    year: "2026",
    cats: ["branding", "web"],
    image: kickflip,
    alt: "Skater holding a patterned longboard across her shoulders under a bright sky",
    gallery: [
      { image: kickflipGallery1, alt: "A Kickflip deck flipped graphic-side up, wheels in the air, on a sky-blue set" },
      { image: kickflipGallery2, alt: "Three Kickflip decks with different graphics leaning on an orange wall" },
      { image: kickflipGallery3, alt: "A stack of urethane skate wheels with one rolling away, on teal" },
      { image: kickflipGallery4, alt: "A Kickflip deck resting on the coping of a mini ramp" },
    ],
    description: "A skate brand that finally looks like skaters. We built an identity and an online shop with the same loose, sun-bleached energy as a Saturday at the park.",
  },
  {
    title: "Northway Records",
    meta: "Motion identity",
    year: "2025",
    cats: ["motion", "branding"],
    image: northway,
    alt: "Studio microphone lit green and gold against a red glow",
    gallery: [
      { image: northwayGallery1, alt: "A Northway record sliding out of a red sleeve, lit red and green" },
      { image: northwayGallery2, alt: "A fanned stack of Northway record sleeves in red, green and cream" },
      { image: northwayGallery3, alt: "A cream cassette tape with a red Northway label on deep green" },
      { image: northwayGallery4, alt: "A row of glossy red and green level bars, like a sound meter" },
    ],
    description: "A label logo that plays along with the music. We built a motion identity that moves to the beat, from the first sleeve to the last stage screen.",
  },
  {
    title: "Drift Campers",
    meta: "Website, booking platform",
    year: "2025",
    cats: ["web"],
    image: drift,
    alt: "Glowing bell tent under olive trees at night",
    gallery: [
      { image: driftGallery1, alt: "A canvas bell tent glowing warm against a dark night set" },
      { image: driftGallery2, alt: "A camping lantern with a warm flame on a dark green set" },
      { image: driftGallery3, alt: "The Drift booking site on a phone, standing in warm light" },
      { image: driftGallery4, alt: "Three bell tents glowing in a row at night" },
    ],
    description: "Bookings doubled and the vans stayed charming. We designed a website and booking platform that feels as easy as pulling up somewhere nice and staying the night.",
  },
  {
    title: "Lumen Mobile",
    meta: "Launch campaign, motion",
    year: "2025",
    cats: ["motion"],
    image: lumen,
    alt: "Hand holding a smartphone with a dark screen that glows orange at the bottom",
    gallery: [
      { image: lumenGallery1, alt: "A Lumen phone on a black pedestal, its screen glowing orange" },
      { image: lumenGallery2, alt: "Two Lumen phones fanned, one showing the screen and one the camera" },
      { image: lumenGallery3, alt: "A Lumen phone lying face up on a black block, light spilling onto it" },
      { image: lumenGallery4, alt: "The lumen wordmark lit from behind by a warm orange glow" },
    ],
    description: "A phone launch with actual personality. A new phone brand entering a crowded category, and a launch campaign on a deadline that scared other agencies off.",
  },
  {
    title: "Bloom Hours",
    meta: "Campaign, art direction",
    year: "2024",
    cats: ["branding"],
    image: bloom,
    alt: "Black-and-white close-up of a glass perfume bottle with a silver cap",
    gallery: [
      { image: bloomGallery1, alt: "A Bloom Hours glass perfume bottle on a glossy black floor" },
      { image: bloomGallery2, alt: "A perfume bottle beside a single white flower, in black and white" },
      { image: bloomGallery3, alt: "The matte black Bloom Hours box with a silver line, the bottle in front" },
      { image: bloomGallery4, alt: "Three Bloom Hours bottles in different sizes on a mirrored floor" },
    ],
    description: "Fragrance photographed like a memory. We art directed a campaign that lets the bottle disappear into the feeling of an hour you wish you could keep.",
  },
  {
    title: "Fieldnote",
    meta: "Editorial design, website",
    year: "2024",
    cats: ["web"],
    image: fieldnote,
    alt: "Colourful notebooks laid out on a wooden desk",
    gallery: [
      { image: fieldnoteGallery1, alt: "A stack of Fieldnote notebooks in six colours on a warm set" },
      { image: fieldnoteGallery2, alt: "An open Fieldnote notebook with a red pencil, on yellow" },
      { image: fieldnoteGallery3, alt: "Fieldnote issues standing in a row like books on a shelf, on green" },
      { image: fieldnoteGallery4, alt: "The Fieldnote website in a browser window, laid out in issue colours" },
    ],
    description: "Editorial design and a website for people who write things down. A notebook brand that wanted its pages to feel as good on screen as they do in the hand.",
  },
  {
    title: "Orbit Labs",
    meta: "Brand system, website",
    year: "2024",
    cats: ["web", "branding"],
    image: orbit,
    alt: "Orange archways opening onto a pale corridor with soft spheres",
    gallery: [
      { image: orbitGallery1, alt: "A corridor of orange Orbit Labs arches receding into soft light" },
      { image: orbitGallery2, alt: "A single tall orange arch with a pale sphere passing through" },
      { image: orbitGallery3, alt: "Pale rings orbiting a soft sphere on an orange set" },
      { image: orbitGallery4, alt: "Orange arches and soft spheres on pale stepped platforms" },
    ],
    description: "A brand system and website for a team building quietly serious things. Warm, rounded and orbiting one idea: make complicated work feel approachable.",
  },
];
