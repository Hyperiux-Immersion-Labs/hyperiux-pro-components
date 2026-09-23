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
// background is the ASCII field reading one of the clips below.
//
// The component's defaults are cut for cube.mp4, which is *high-key*: subject
// and surround both sit in 0.70..0.84, and the trailing invert is what turns
// that bright surround into empty cells so only the subject inks up.
//
// Both clips here have the opposite polarity — a dark field with a bright
// subject. Run through that same invert, the large dark background flips bright
// and inks every cell solid while the subject flips dark and drops out, which
// renders as a silhouette punched through a full grid. So the invert comes off,
// and rampLow/rampHigh and brightnessMap move with it rather than independently:
// the stock window (0.1125..0.55) describes the band brightnessMap *and the
// invert together* leave cube.mp4 in, and with no invert the post-curve tone no
// longer lands there — kept as-is it would index the ramp over the wrong slice
// and put one glyph across the whole frame. Same combination the pricing hero
// uses for its own dark-field clip.
const DARK_FIELD_BASE = {
  invert: false,
  brightnessMap: 0.8,
  rampLow: 0,
  rampHigh: 0.63,
};

// Levels are per-clip: they stretch each clip's real band across 0..1, so they
// track its measured luminance rather than being shared.
//
//   test1  Ymin 0.00  bulk 0.19..0.30  Ymax 1.00  — 30.6 MB, 30s
//   test2  Ymin 0.06  bulk 0.09..0.25  Ymax 0.84  —  2.7 MB, 10s
//
// Framing keeps the stock offset so the subject sits right of the copy, the way
// cube.mp4 does. cube needs that offset because it frames its subject left of
// centre; test1's ring is already centred, so the same push lands it slightly
// further right — which is the intended placement here regardless.
//
// The background is what carries cube.mp4's look, and it is worth being precise
// about why. cube's surround (corners 0.70..0.84) sits *inside* its own levels
// window (0.7..0.92), so it is never excluded — it maps through, inverts to
// roughly 0.1..0.6, and inks sparsely. That faint all-over field is the texture
// the subject reads as a denser region within; drop it and the subject is left
// alone on flat black, which is what "plain" looks like.
//
// test1's surround is a narrow, near-static band: corners hold 0.192..0.237 from
// frame 30 to 700, drifting under 0.01 across the clip. A levelsLow above that
// band (0.24 was) clamps all of it to zero and takes the ambient field with it.
// So the floor goes just under the band instead, keeping the surround inside the
// window where it inks at the sparse end.
//
// brightnessMap is what keeps that from bringing the old seam back. The band is
// only ~0.045 wide, so at a steeper curve its two ends straddle the blank/inked
// boundary and the crossing contour shows as a line. Flattening the curve lands
// the whole band on adjacent ramp slots, so it reads as one even field.
const VIDEO_CONFIGS = {
  "/test1.mp4": {
    ...DARK_FIELD_BASE,
    levelsLow: 0.185,
    levelsHigh: 0.6,
    brightnessMap: 0.95,
    videoScale: 0.8,
    videoOffsetX: 0.31,
  },
  "/test2.mp4": { ...DARK_FIELD_BASE, levelsLow: 0.06, levelsHigh: 0.5 },
};

const VIDEO_SRC = "/test1.mp4";
const VIDEO_CONFIG = VIDEO_CONFIGS[VIDEO_SRC];

export default function BlogHero() {
  useFadeUp();

  // The homepage animates this 0 -> 1 as its loader hands off. There's no
  // loader on /blog, so the field starts settled and simply draws.
  const introRef = useRef(1);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-background">
      <div className="absolute inset-0">
        <CubeBackgroundAscii
          intro={introRef}
          src={VIDEO_SRC}
          config={VIDEO_CONFIG}
        />
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
