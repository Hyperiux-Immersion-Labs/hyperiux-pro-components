"use client";

import ParallaxStripSlider from "@/components/parallax-strip-slider";

const R2_BASE =
  "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/strip-paralax-slider";

const SLIDES = [
  {
    src: `${R2_BASE}/img01.png`,
    title: "Fire",
    chapter: "Collection 01",
  },
  {
    src: `${R2_BASE}/img02.png`,
    title: "Allure",
    chapter: "Collection 02",
  },
  {
    src: `${R2_BASE}/img03.png`,
    title: "Ember",
    chapter: "Collection 03",
  },
];

export default function Page() {
  return (
    <main className="h-dvh w-full bg-black">
      <ParallaxStripSlider slides={SLIDES} />
    </main>
  );
}
