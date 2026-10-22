// Built using Hyperiux Vault: https://vault.hyperiux.com

import type { StaticImageData } from "next/image";
import journal1 from "../../assets/pictures/j-1.webp";
import journal2 from "../../assets/pictures/j-2.webp";
import journal3 from "../../assets/pictures/j-3.webp";
import journal4 from "../../assets/pictures/j-4.webp";
import journal5 from "../../assets/pictures/j-5.webp";
import journal6 from "../../assets/pictures/j-6.webp";
import journal7 from "../../assets/pictures/j-7.webp";
import journal8 from "../../assets/pictures/j-8.webp";
import journal9 from "../../assets/pictures/j-9.webp";

export type Post = {
  slug: string;
  category: string;
  date: string;
  dateTime: string;
  title: string;
  excerpt: string;
  image: StaticImageData;
};

export const POSTS: Post[] = [
  {
    category: "Process",
    date: "Sep 9, 2026",
    dateTime: "2026-09-09",
    slug: "rebuilt-a-bank",
    title: "We rebuilt a bank in twelve weeks. Here’s what broke first.",
    excerpt: "A hard deadline, a cautious board and one very long spreadsheet. The schedule forced better decisions.",
    image: journal2,
  },
  {
    category: "Design",
    date: "Aug 27, 2026",
    dateTime: "2026-08-27",
    slug: "logo-that-moves",
    title: "If your logo can’t move, it’s only half a logo.",
    excerpt: "Your brand lives on screens now. A still logo is a photo of a dancer.",
    image: journal3,
  },
  {
    category: "Studio",
    date: "Aug 12, 2026",
    dateTime: "2026-08-12",
    slug: "publish-our-prices",
    title: "Why we publish our prices (and why our competitors hate it).",
    excerpt: "Hiding prices wastes everyone’s week. Ours are on the website. Here’s the reasoning, and the maths.",
    image: journal4,
  },
  {
    category: "Process",
    date: "Jul 30, 2026",
    dateTime: "2026-07-30",
    slug: "brief-without-a-meeting",
    title: "How to write a brief that doesn’t need a meeting.",
    excerpt: "Short, specific, slightly uncomfortable to write. A template you can steal.",
    image: journal5,
  },
  {
    category: "Design",
    date: "Jul 15, 2026",
    dateTime: "2026-07-15",
    slug: "typefaces-for-2035",
    title: "Typefaces that will still look good in 2035.",
    excerpt: "Trends in type age like milk. These are the choices we keep coming back to.",
    image: journal6,
  },
  {
    category: "Studio",
    date: "Jun 30, 2026",
    dateTime: "2026-06-30",
    slug: "four-studios-one-chat",
    title: "Four studios, three time zones, one group chat.",
    excerpt: "How Delhi hands over to London, London to Dubai and everyone to New York without losing the thread.",
    image: journal7,
  },
  {
    category: "Branding",
    date: "Jun 18, 2026",
    dateTime: "2026-06-18",
    slug: "naming-project",
    title: "600 names, one survivor: inside a naming project.",
    excerpt: "From the long list to the trademark search, and the 599 we had to let go.",
    image: journal8,
  },
  {
    category: "Design",
    date: "Jun 2, 2026",
    dateTime: "2026-06-02",
    slug: "packaging-people-keep",
    title: "Packaging people refuse to throw away.",
    excerpt: "The best packs end up on a shelf at home. What earns them the spot.",
    image: journal9,
  },
];

export const FEATURED_POST: Post = {
  slug: "brand-guidelines",
  category: "Branding",
  date: "Sep 24, 2026",
  dateTime: "2026-09-24",
  title: "Your brand guidelines are too long. Nobody reads page 74.",
  excerpt: "The longer the rulebook, the less your brand looks like itself. How we write guidelines people open on purpose.",
  image: journal1,
};

export const ALL_POSTS: Post[] = [FEATURED_POST, ...POSTS];
