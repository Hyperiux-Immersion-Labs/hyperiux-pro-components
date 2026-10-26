"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ImagePixelReveal, { type ImagePixelRevealProps } from "@/components/image-pixel-reveal";
import DemoHeader from "@/components/preview-chrome/DemoHeader";
import LenisSmoothScroll from "@/components/SmoothScroll/LenisScroll";
import ScrollBottom from "@/components/WebsiteComps/ScrollBottom";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";
import type { RegistryLike } from "@/components/remixer-panel/types";
import HeadAnim from "@/components/Animations/HeadAnim";
import SplitLine from "@/components/WebsiteComps/SplitLine";
import { MEDIA } from "@/lib/breakpoints";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const R2 =
  "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images";

const TALL = "h-[34vw] max-md:h-[120vw]";
const SHORT = "h-[24vw] max-md:h-[90vw]";

// Three columns, tall and short in turn so the rows stagger; one column on phones.
// Each column drifts at its own speed for the parallax.
const COLUMNS = [
  { speed: 1, images: [{ src: `${R2}/abs01.jpg`, size: TALL }, { src: `${R2}/abs02.avif`, size: SHORT }] },
  { speed: 3, images: [{ src: `${R2}/abs03.avif`, size: SHORT }, { src: `${R2}/abs04.avif`, size: TALL }] },
  { speed: 2, images: [{ src: `${R2}/abs05.avif`, size: TALL }, { src: `${R2}/abs06.avif`, size: SHORT }] },
];

// The middle column reveals the opposite way to the outer two
const OPPOSITE = { down: "up", up: "down", left: "right", right: "left" } as const;

function Gallery({ values }: { values: Record<string, unknown> }) {
  const shared = {
    gridSize: values.gridSize as number,
    edgeHeight: values.edgeHeight as number,
    direction: values.direction as ImagePixelRevealProps["direction"],
    scrub: values.scrub as boolean,
    duration: values.duration as number,
    start: "top bottom",
    end: "bottom 70%",
  } satisfies ImagePixelRevealProps;

  const parallax = values.parallax as number;
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Each column drifts at its own speed; the photo also slides inside its frame
  useGSAP(
    () => {
      if (!parallax || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const isMobile = window.matchMedia(MEDIA.mobile).matches;

      gsap.utils.toArray<HTMLElement>("[data-parallax-column]").forEach((column, index) => {
        // one column on phones, so the columns don't drift apart there
        if (isMobile) return;
        const speed = COLUMNS[index].speed * parallax;
        gsap.fromTo(
          column,
          { y: () => (speed * window.innerWidth) / 100 },
          {
            y: () => (-speed * window.innerWidth) / 100,
            ease: "none",
            scrollTrigger: { trigger: column, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-parallax-frame]").forEach((frame) => {
        gsap.fromTo(
          frame.querySelector("img"),
          { yPercent: -8 * parallax },
          {
            yPercent: 8 * parallax,
            ease: "none",
            scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true },
          },
        );
      });
    },
    { dependencies: [parallax], scope: rootRef, revertOnUpdate: true },
  );

  return (
    <div ref={rootRef} className="flex items-start gap-[1.5vw] px-[5vw] max-md:flex-col max-md:gap-[6vw]">
      {COLUMNS.map((column, index) => (
        <div key={index} data-parallax-column className="flex flex-1 flex-col gap-[1.5vw] max-md:w-full max-md:gap-[6vw]">
          {column.images.map((image) => (
            <div key={image.src} data-parallax-frame className={`w-full ${image.size}`}>
              <ImagePixelReveal
                {...shared}
                direction={index === 1 ? OPPOSITE[shared.direction ?? "down"] : shared.direction}
                alt=""
                className="h-full w-full"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.src} alt="" className="h-full w-full scale-[1.2] object-cover" />
              </ImagePixelReveal>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function DemoContent({ registry }: { registry: RegistryLike }) {
  return (
    <RegistryRemixerDemo
      registry={registry}
      render={(values) => <Gallery values={values} />}
      copyCodeOptions={{ propsVariableName: "imagePixelRevealProps" }}
    >
      {({ effect }) => (
        <>
          <LenisSmoothScroll />
          <DemoHeader
            reducedMotionNote={{
              title: "The images show straight away.",
              body: "With reduced motion, Pixel Reveal skips the pixel animation and the parallax, and shows every image fully revealed, with nothing tied to scroll.",
            }}
          />
          <main className="bg-[#0d0d0d] pb-[35vh] text-white max-md:pb-[30vh]">
            <section className="flex h-[80vh] flex-col items-center justify-center gap-[1vw] pt-[5vw] max-md:pt-[15vw] px-[5vw] text-center max-md:gap-[3vw]">
              <HeadAnim>
                <h1 className="text-[4vw] max-md:text-[10vw]">Image Pixel Reveal</h1>
              </HeadAnim>
              <SplitLine>
                <p className="text-white/55 max-md:w-[80vw]">
                  Scroll to build each image out of pixels, with a soft parallax drift.
                </p>
              </SplitLine>
            </section>
            {effect}
          </main>
          <ScrollBottom textColor="text-white" className="bottom-[4%] gap-[0.5vw] max-md:gap-[2vw]" />
        </>
      )}
    </RegistryRemixerDemo>
  );
}
