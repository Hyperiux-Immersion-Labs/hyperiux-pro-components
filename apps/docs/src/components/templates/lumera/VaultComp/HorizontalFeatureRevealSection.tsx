"use client";

import { useEffect, useId, type CSSProperties } from "react";
import Image, { type StaticImageData } from "next/image";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import { SplitText } from "gsap/dist/SplitText";
import project1 from "../assets/project-1.png";

gsap.registerPlugin(ScrollTrigger, SplitText);

interface FeatureStat {
  value: string;
  label: string;
}

interface FeatureItem {
  number: string;
  title: string;
  description: string;
  image: StaticImageData;
  thumbnails: StaticImageData[];
  cta: string;
  stats: FeatureStat[];
}

const RESIDENCE_DATA: FeatureItem[] = [
  {
    number: "01",
    title: "The Palm Residence",
    description:
      "A contemporary beachfront villa shaped around open spaces, uninterrupted sea views and effortless indoor-outdoor living.",
    image: project1,
    thumbnails: [project1, project1, project1, project1],
    cta: "View Residence",
    stats: [
      { value: "12,400 sq. ft.", label: "Living Area" },
      { value: "06", label: "Bedrooms" },
      { value: "08", label: "Bathrooms" },
      { value: "AED 48,000,000", label: "Price" },
    ],
  },
  {
    number: "02",
    title: "Skyline Crest Penthouse",
    description:
      "An expansive penthouse retreat with wraparound terraces, double-height entertaining spaces and panoramic city views in every direction.",
    image: project1,
    thumbnails: [project1, project1, project1, project1],
    cta: "Explore Penthouse",
    stats: [
      { value: "9,850 sq. ft.", label: "Living Area" },
      { value: "05", label: "Bedrooms" },
      { value: "07", label: "Bathrooms" },
      { value: "AED 36,500,000", label: "Price" },
    ],
  },
  {
    number: "03",
    title: "Lagoon Courtyard Villa",
    description:
      "A tranquil villa collection centered around private gardens, water-facing lounges and refined interiors crafted for everyday ease.",
    image: project1,
    thumbnails: [project1, project1, project1, project1],
    cta: "Discover Villa",
    stats: [
      { value: "10,200 sq. ft.", label: "Living Area" },
      { value: "05", label: "Bedrooms" },
      { value: "06", label: "Bathrooms" },
      { value: "AED 29,900,000", label: "Price" },
    ],
  },
  {
    number: "04",
    title: "Marina Horizon Estate",
    description:
      "A statement residence overlooking the water, pairing spa-style amenities, curated entertaining zones and a seamless resort atmosphere.",
    image: project1,
    thumbnails: [project1, project1, project1, project1],
    cta: "See Estate",
    stats: [
      { value: "14,100 sq. ft.", label: "Living Area" },
      { value: "07", label: "Bedrooms" },
      { value: "09", label: "Bathrooms" },
      { value: "AED 54,000,000", label: "Price" },
    ],
  },
];

export default function HorizontalFeatureRevealSection() {
  const uid = useId().replace(/:/g, "");
  const sectionId = `lumera-residences-${uid}`;
  const imageParallaxRange = 24;

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (window.innerWidth <= 1025) {
        return;
      }

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      gsap.set(".lumera-residence-image, .lumera-residence-number, .lumera-residence-title, .lumera-residence-copy, .lumera-residence-stat, .lumera-residence-cta", { opacity: 1 });

      const containerTween = gsap.to(".lumera-residence-track", {
        xPercent: -76,
        ease: "none",
        scrollTrigger: {
          trigger: `#${sectionId}`,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        },
      });

      const cards = gsap.utils.toArray<HTMLElement>(".lumera-residence-card");

      cards.forEach((card) => {
        const animateTarget = (
          selector: string,
          animation: gsap.TweenVars,
          splitType: "chars,lines" | "lines" = "lines",
          delay = 0,
        ) => {
          const element = card.querySelector(selector);
          if (!element) {
            return;
          }

          const split = new SplitText(element, {
            type: splitType,
            mask: "lines",
          });

          const targets = splitType === "chars,lines" ? split.chars : split.lines;

          gsap.from(
            targets,
            reduceMotion
              ? {
                  opacity: 0,
                  stagger: 0.05,
                  duration: 0.5,
                  delay,
                  scrollTrigger: {
                    trigger: card,
                    start: "left center",
                    toggleActions: "play none none reverse",
                    horizontal: true,
                    containerAnimation: containerTween,
                  },
                }
              : {
                  ...animation,
                  stagger: 0.05,
                  duration: 0.7,
                  delay,
                  ease: "power2.out",
                  scrollTrigger: {
                    trigger: card,
                    start: "left center",
                    toggleActions: "play none none reverse",
                    horizontal: true,
                    containerAnimation: containerTween,
                  },
                },
          );
        };

        animateTarget(".lumera-residence-number", { y: 120, rotate: 8 }, "chars,lines");
        animateTarget(".lumera-residence-title", { yPercent: 100 });

        card.querySelectorAll(".lumera-residence-copy").forEach((element, index) => {
          const split = new SplitText(element, { type: "lines", mask: "lines" });

          gsap.from(
            split.lines,
            reduceMotion
              ? {
                  opacity: 0,
                  stagger: 0.05,
                  duration: 0.5,
                  delay: index * 0.05,
                  scrollTrigger: {
                    trigger: card,
                    start: "left center",
                    toggleActions: "play none none reverse",
                    horizontal: true,
                    containerAnimation: containerTween,
                  },
                }
              : {
                  yPercent: 100,
                  stagger: 0.05,
                  duration: 0.7,
                  delay: index * 0.05,
                  ease: "power2.out",
                  scrollTrigger: {
                    trigger: card,
                    start: "left center",
                    toggleActions: "play none none reverse",
                    horizontal: true,
                    containerAnimation: containerTween,
                  },
                },
          );
        });

        gsap.from(card.querySelectorAll(".lumera-residence-stat"), {
          y: reduceMotion ? 0 : 40,
          opacity: 0,
          stagger: 0.08,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "left center",
            toggleActions: "play none none reverse",
            horizontal: true,
            containerAnimation: containerTween,
          },
        });

        if (reduceMotion) {
          gsap.set(card.querySelector(".lumera-residence-image"), { x: 0 });
        } else {
          gsap.to(card.querySelector(".lumera-residence-image"), {
            translateX: `${imageParallaxRange}%`,
            ease: "none",
            scrollTrigger: {
              trigger: card,
              start: "left right",
              end: "right left",
              scrub: true,
              horizontal: true,
              containerAnimation: containerTween,
            },
          });
        }
      });

      ScrollTrigger.refresh();
    });

    return () => ctx.revert();
  }, [sectionId]);

  return (
    <section
      id={sectionId}
      className="relative h-[520vh] bg-[#f5f1eb] text-[#1c1b1a] max-[1025px]:h-auto"
    >
      <div className="sticky top-0 h-screen overflow-hidden max-[1025px]:static max-[1025px]:h-auto">
        <div
          className="lumera-residence-track flex h-full w-fit gap-[4vw] px-[0vw] max-[1025px]:flex-col max-[1025px]:gap-[12vw] max-[1025px]:px-[5%] max-[1025px]:py-[15%]"
          style={{ "--card-gap": "4vw" } as CSSProperties}
        >
          {RESIDENCE_DATA.map((item) => (
            <article
              key={item.number}
              className="lumera-residence-card flex h-screen w-[92vw] flex-none overflow-hidden rounded-none bg-[#f5f1eb] max-[1025px]:h-auto max-[1025px]:w-full max-[1025px]:flex-col"
            >
              <div className="h-full w-[42%] overflow-hidden max-[1025px]:w-full max-[1025px]:rounded-[4vw]">
                <Image
                  src={item.image}
                  alt={item.title}
                  width={1000}
                  height={1000}
                  quality={95}
                  className="lumera-residence-image h-full w-full object-cover translate-x-(--image-shift-start) opacity-0 max-[1025px]:translate-x-0 max-[1025px]:opacity-100"
                  style={
                    {
                      "--image-shift-start": `-${imageParallaxRange}%`,
                    } as CSSProperties & Record<`--${string}`, string | number>
                  }
                />
              </div>

              <div className="flex w-[58%] flex-col justify-between px-[3.5vw] py-[3.5vw] max-[1025px]:w-full max-[1025px]:px-0 max-[1025px]:pt-[7vw]">
                <div>
                  <p className="lumera-residence-number font-heading text-[4vw] font-medium leading-none  opacity-0 max-[1025px]:text-[18vw] max-[1025px]:opacity-100">
                    {item.number}
                  </p>

                  <h3 className="lumera-residence-title mt-[2vw] max-w-[90%] font-heading text-[3.5vw] font-medium  leading-[1.04] tracking-[-0.05em] opacity-0 max-[1025px]:mt-[5vw] max-[1025px]:max-w-full max-[1025px]:text-[11vw] max-[1025px]:opacity-100">
                    {item.title}
                  </h3>

                  <p className="lumera-residence-copy mt-[3vw] max-w-[80%] text-[1.2vw] leading-[1.4] text-[#1c1b1a]/85 opacity-0 max-[1025px]:mt-[6vw] max-[1025px]:max-w-full max-[1025px]:text-[4.4vw] max-[1025px]:opacity-100">
                    {item.description}
                  </p>

                  <div className="mt-[2.2vw] grid grid-cols-4 max-[1025px]:mt-[7vw] max-[1025px]:grid-cols-2">
                    {item.stats.map((stat, index) => (
                      <div
                        key={`${item.number}-${stat.label}`}
                        className={`lumera-residence-stat relative py-[0.95vw] opacity-0 max-[1025px]:py-[4vw] max-[1025px]:opacity-100 ${
                          index === 0 ? "pr-[3vw]" : "pl-[3vw] pr-[3vw]"
                        } ${
                          index === item.stats.length - 1 ? "pr-0" : ""
                        } max-[1025px]:px-0`}
                      >
                        {index !== 0 ? (
                          <span
                            aria-hidden="true"
                            className="absolute left-0 top-1/2 h-[6vw] w-px -translate-y-1/2 bg-[#DADADA] max-[1025px]:hidden"
                          />
                        ) : null}
                        <p className="font-heading text-[1.4vw] font-medium leading-none tracking-[-0.04em] max-[1025px]:text-[7vw]">
                          {stat.value}
                        </p>
                        <p className="mt-[0.8vw] text-[1vw] text-[#1c1b1a]/75 max-[1025px]:mt-[1.8vw] max-[1025px]:text-[3.7vw]">
                          {stat.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-[1vw] flex flex-col items-start justify-between gap-[2vw] max-[1025px]:mt-[8vw] max-[1025px]:flex-col max-[1025px]:items-start">
                  <div className="flex gap-[1vw] max-[1025px]:gap-[3vw]">
                    {item.thumbnails.map((thumb, index) => (
                      <div
                        key={`${item.number}-thumb-${index}`}
                        className="overflow-hidden rounded-[1.3vw] bg-[#ddd4ca] max-[1025px]:rounded-[4vw]"
                      >
                        <Image
                          src={thumb}
                          alt={`${item.title} preview ${index + 1}`}
                          width={1000}
                          height={1000}
                          quality={95}
                          className="h-[6vw] w-[6vw] object-cover max-[1025px]:h-[20vw] max-[1025px]:w-[20vw]"
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="lumera-residence-cta group inline-flex items-center gap-[1vw] border-b border-[#1c1b1a]/60 pb-[0.6vw] font-heading text-[1.8vw] leading-none text-[#1c1b1a] opacity-0 transition-opacity max-[1025px]:pb-[1.8vw] max-[1025px]:pt-[4vw] max-[1025px]:text-[6vw] max-[1025px]:opacity-100"
                  >
                    <span>{item.cta}</span>
                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
