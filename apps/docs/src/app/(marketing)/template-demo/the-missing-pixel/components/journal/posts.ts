// Built using Hyperiux Vault: https://vault.hyperiux.com

import type { StaticImageData } from "next/image";
import cloudline from "../../assets/w-cloudline.webp";
import kickflip from "../../assets/w-kickflip.webp";
import northway from "../../assets/w-northway.webp";
import drift from "../../assets/w-drift.webp";
import studio1 from "../../assets/studio-1.webp";
import studio2 from "../../assets/studio-2.webp";

export type Post = {
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
    title: "We rebuilt a bank in twelve weeks. Here’s what broke first.",
    excerpt: "A hard deadline, a cautious board and one very long spreadsheet. The schedule forced better decisions.",
    image: kickflip,
  },
  {
    category: "Design",
    date: "Aug 27, 2026",
    dateTime: "2026-08-27",
    title: "If your logo can’t move, it’s only half a logo.",
    excerpt: "Your brand lives on screens now. A still logo is a photo of a dancer.",
    image: northway,
  },
  {
    category: "Studio",
    date: "Aug 12, 2026",
    dateTime: "2026-08-12",
    title: "Why we publish our prices (and why our competitors hate it).",
    excerpt: "Hiding prices wastes everyone’s week. Ours are on the website. Here’s the reasoning, and the maths.",
    image: drift,
  },
  {
    category: "Process",
    date: "Jul 30, 2026",
    dateTime: "2026-07-30",
    title: "How to write a brief that doesn’t need a meeting.",
    excerpt: "Short, specific, slightly uncomfortable to write. A template you can steal.",
    image: cloudline,
  },
  {
    category: "Design",
    date: "Jul 15, 2026",
    dateTime: "2026-07-15",
    title: "Typefaces that will still look good in 2035.",
    excerpt: "Trends in type age like milk. These are the choices we keep coming back to.",
    image: studio1,
  },
  {
    category: "Studio",
    date: "Jun 30, 2026",
    dateTime: "2026-06-30",
    title: "Four studios, three time zones, one group chat.",
    excerpt: "How Delhi hands over to London, London to Dubai and everyone to New York without losing the thread.",
    image: studio2,
  },
  {
    category: "Branding",
    date: "Jun 18, 2026",
    dateTime: "2026-06-18",
    title: "600 names, one survivor: inside a naming project.",
    excerpt: "From the long list to the trademark search, and the 599 we had to let go.",
    image: kickflip,
  },
  {
    category: "Design",
    date: "Jun 2, 2026",
    dateTime: "2026-06-02",
    title: "Packaging people refuse to throw away.",
    excerpt: "The best packs end up on a shelf at home. What earns them the spot.",
    image: northway,
  },
];
