
// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";
import { useState } from "react";
import { type StaticImageData } from "next/image";
import { AnimatePresence, motion } from "motion/react";
import InfiniteCarouselComp from "./VaultComp/InfiniteCarouselComp";
import { usePrefersReducedMotion } from "./reducedMotion";
import portfolio1 from "./assets/portfolio-1.png";
import portfolio2 from "./assets/portfolio-2.png";
import portfolio3 from "./assets/portfolio-3.png";
import portfolio4 from "./assets/portfolio-4.png";
import portfolio5 from "./assets/portfolio-5.png";

interface AboutSlide {
  src: StaticImageData;
  title: string;
  description: string;
}

const aboutSlides: AboutSlide[] = [
  {
    src: portfolio1,
    title: "Waterfront Landmark",
    description: "An iconic waterfront address blending grandeur with modern hospitality.",
  },
  {
    src: portfolio2,
    title: "Serene Interiors",
    description: "Warm, tactile interiors designed for comfort and quiet luxury.",
  },
  {
    src: portfolio3,
    title: "Architectural Identity",
    description:
      "A bold modern structure designed to define the Manhattan skyline with elegance and strength.",
  },
  {
    src: portfolio4,
    title: "Wellness Retreat",
    description: "Private spa spaces crafted for rest, recovery and quiet reflection.",
  },
  {
    src: portfolio5,
    title: "Poolside Living",
    description: "Resort-style pools framed by warm stone and ambient lighting.",
  },
];

// Module scope keeps the array identity stable across renders, so the carousel
// never tears down its GSAP setup mid-drag.
const carouselSlides = aboutSlides.map(({ src, title }) => ({ src, alt: title }));

const CENTER_SLIDE_INDEX = 2;

const About = () => {
  const [activeIndex, setActiveIndex] = useState(CENTER_SLIDE_INDEX);
  const reducedMotion = usePrefersReducedMotion();
  const activeSlide = aboutSlides[activeIndex] ?? aboutSlides[CENTER_SLIDE_INDEX];

  return (
    <section className="overflow-hidden bg-[#E0D4C6]" id="about">
      <div className={` py-[5%]  pt-[10%] max-md:py-[20%] max-md:pb-[40%] max-[1025px]:py-[15%]`}>
        <div className="w-full px-[5%] max-md:px-[6%] flex justify-between max-[1025px]:flex-col max-[1025px]:gap-[8vw]">
          <h2
            data-para-anim
            className={`w-[45%] max-md:w-[90%]  font-heading text-[3.9vw] font-medium leading-[1.2]  max-md:text-[8vw] text-[#1c1b1a] mt-[-1vw] max-[1025px]:w-[90%] max-[1025px]:text-[8vw]`}
          >
            Real Estate,
            <br />
            Considered Differently
          </h2>
          <div className="w-[35%] space-y-[1.5vw] text-[#1c1b1a]/80 text-[1.25vw] max-md:text-[3.5vw] max-[1025px]:w-full">
            <p data-para-anim>We believe finding the right home begins with understanding how you want to live.</p>
            <p data-para-anim>
              From waterfront residences to private villas and landmark penthouses, we bring together exceptional
              properties with thoughtful guidance to make every decision feel considered, personal and effortless.
            </p>
          </div>
        </div>

        <div className="fadeup mt-[4vw] max-md:mt-[8vw]">
          <InfiniteCarouselComp
            slides={carouselSlides}
            initialIndex={CENTER_SLIDE_INDEX}
            onActiveIndexChange={setActiveIndex}
            draggable
          />

          <div data-para-anim className="mx-auto mt-[1vw] max-md:mt-[5vw] max-w-[24vw] text-center max-[1025px]:max-w-[70vw] max-md:space-y-[2vw]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeIndex}
                initial={reducedMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reducedMotion ? undefined : { opacity: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className={`font-heading text-[2.3vw] leading-[1.2] font-medium max-md:text-[5vw] text-[#1c1b1a] max-[1025px]:text-[5vw]`}>
                  {activeSlide.title}
                </p>
                <p className="mt-[0.5vw] w-[90%] text-center mx-auto text-[1.01vw] text-[#1C1B1A] max-[1025px]:text-[2.5vw] max-md:text-[3vw]">
                  {activeSlide.description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
