"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import SplitLine from "@/components/WebsiteComps/SplitLine";
import LineReveal from "@/components/Animations/LineReveal";
import { useFadeUp } from "@/components/Animations/gsapAnimations";

const ASCII_FALLBACK = <div className="absolute inset-0 bg-background" aria-hidden />;

// Same WebGL-only treatment the homepage hero gives it - the canvas reads a
// video texture, so it has no business in the server bundle.
const CubeBackgroundAscii = dynamic(
  () => import("@/homepage-v3/components/CubeBackgroundAscii"),
  { ssr: false, loading: () => ASCII_FALLBACK },
);

// Copy layer matches the pricing hero (components/Pricing/Hero.jsx); the
// background is the homepage cube, rendered with its own defaults.
export default function BlogHero() {
  useFadeUp();

  // The homepage animates this 0 -> 1 as its loader hands off. There's no
  // loader on /blog, so the field starts settled and simply draws.
  const introRef = useRef(1);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-background">
      <div className="absolute inset-0">
        <CubeBackgroundAscii intro={introRef} />
      </div>

      <section className="absolute inset-0 z-20 pointer-events-none self-padd h-full flex max-md:items-end max-md:pb-[20vw]! items-center w-full">
        <div className="space-y-[2vw] max-[1025px]:space-y-[8vw] mt-[2vw] max-[1025px]:mt-0 relative z-2 w-[75%] max-[1025px]:w-full">
          <div className="h-fit flex max-md:flex-col max-md:justify-start items-center w-full">
            <LineReveal
              as="h1"
              className="t96 max-md:text-left max-md:indent-0! relative w-full text-white"
            >
              <span className="gradient-text-animate">Start Free Today.</span> Upgrade to Pro for Complete Access.
            </LineReveal>
          </div>
          <SplitLine
            as="p"
            start="top 120%"
            className="text24 max-sm:text-left text-[#C9C9C9] w-[65%] max-sm:w-[95%] max-md:w-[80%]"
          >
            Free Core is open today with 30+ source-first React and Next.js effects. Vault Pro is available now, unlocking 80+ premium effects across scroll systems, cursor effects, text reveals, page transitions, loaders, backgrounds, and WebGL scenes.
          </SplitLine>
        </div>
      </section>
    </div>
  );
}
