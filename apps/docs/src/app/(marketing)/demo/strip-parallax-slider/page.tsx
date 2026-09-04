"use client";

import ParallaxStripSlider from "@/components/parallax-strip-slider";
import img1 from "./img1.webp";
import img2 from "./img2.webp";
import img3 from "./img3.webp";

const SLIDES = [
  {
    src: img1.src,
    title: "Focus",
    chapter: "Chapter 01",
  },
  {
    src: img2.src,
    title: "Drive",
    chapter: "Chapter 02",
  },
  {
    src: img3.src,
    title: "Endure",
    chapter: "Chapter 03",
  },
];

export default function Page() {
  return (
    <main className="h-dvh w-full bg-black">
      <ParallaxStripSlider slides={SLIDES} />
    </main>
  );
}
