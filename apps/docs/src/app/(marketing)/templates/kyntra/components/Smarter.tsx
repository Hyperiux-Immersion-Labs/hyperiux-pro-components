// Built using Hyperiux Vault: https://vault.hyperiux.com
"use client";

import { useEffect, useRef } from "react";
import Image, { type StaticImageData } from "next/image";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import SmoothInfiniteCarousel, {
  type KeyboardSlider,
} from "./smooth-carousel/SmoothInfiniteCarousel";
import CarouselNavButtons from "./Buttons/NavButtons";

import FocusTextWrap from "./effects/focus-text/wrap";
import { ParaAnim } from "./Animations/gsapAnim";
import { prefersReducedMotion } from "./Animations/reducedMotion";

import bookService from "../assets/smarter/book-service.svg";
import visit from "../assets/smarter/visit.svg";
import serviceRecord from "../assets/smarter/service-record.svg";
import home from "../assets/smarter/home.svg";
import maintainance from "../assets/smarter/maintainance.svg";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const KYNTRA_PRIMARY = "#134BD6";

export interface SmarterCardData {
  id: number;
  title: string;
  description: string;
  icon: StaticImageData;
  variant: "primary" | "dark";
}

const SMARTER_CARDS: SmarterCardData[] = [
  {
    id: 1,
    title: "Book a\nService",
    description:
      "Tell Kyntra what your home needs and book the right service at a time that works for you.",
    icon: bookService,
    variant: "primary",
  },
  {
    id: 2,
    title: "Professional\nVisits",
    description:
      "A trusted professional arrives with the details they need to understand your home and the job at hand.",
    icon: visit,
    variant: "dark",
  },
  {
    id: 3,
    title: "Service Gets\nRecorded",
    description:
      "Every completed service is automatically added to your home's history, creating a clear record for future needs.",
    icon: serviceRecord,
    variant: "primary",
  },
  {
    id: 4,
    title: "Kyntra Learns\nYour Home",
    description:
      "Over time, Kyntra builds a better understanding of your home, its systems, preferences, and maintenance patterns.",
    icon: home,
    variant: "dark",
  },
  {
    id: 5,
    title: "Future Maintenance\nGets Easier",
    description:
      "With everything in one place, Kyntra can help you stay ahead of maintenance and make future services faster and simpler.",
    icon: maintainance,
    variant: "primary",
  },
];

const CAROUSEL_CARDS = [...SMARTER_CARDS, ...SMARTER_CARDS];

const SLIDER_GUTTER_PCT = 5;

export default function Smarter() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const carouselWrapperRef = useRef<HTMLDivElement | null>(null);
  const sliderRef = useRef<KeyboardSlider | null>(null);

  const stripShiftRef = useRef<HTMLDivElement | null>(null);

  const syncStripShift = () => {
    const slider = sliderRef.current;
    const strip = stripShiftRef.current;
    if (!slider || !strip) return;

    const { wrapperWidth, itemWidth } = slider.viewport;
    if (!wrapperWidth || !itemWidth) return;

    const gutter = (wrapperWidth * SLIDER_GUTTER_PCT) / 100;
    const shift = wrapperWidth / 2 - itemWidth / 2 - gutter;
    strip.style.transform = `translateX(${-shift}px)`;
  };

  const handleReady = (slider: KeyboardSlider) => {
    sliderRef.current = slider;
    stripShiftRef.current = slider.wrapper as HTMLDivElement;

    requestAnimationFrame(syncStripShift);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ctx = gsap.context(() => {
      const wrapper = carouselWrapperRef.current;
      if (!wrapper) return;

     
      if (prefersReducedMotion()) return;

      gsap.set(wrapper, { xPercent: 80 });

      gsap.to(wrapper, {
        xPercent: 0,
        duration: 1.6,
        ease: "power3.out",
        scrollTrigger: {
          trigger: wrapper,
          start: "top 90%",
          // markers: true,
          once: true,
        },
        onComplete: () => {
          gsap.set(wrapper, { clearProps: "transform" });
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.addEventListener("resize", syncStripShift);
    return () => window.removeEventListener("resize", syncStripShift);
  }, []);

  return (
    <section
      id="smarter"
      ref={sectionRef}
      className=" relative z-10 w-full overflow-hidden bg-white"
    >
      {/* Header */}
      <div className="mx-auto flex max-w-400 flex-col gap-[2vw] px-[5%] py-[5%] max-md:gap-8 max-md:mb-8">
        <FocusTextWrap>
          <h2 className="font-helvetica-neue w-[60%] leading-[1.1] font-normal tracking-[-0.02em] whitespace-pre-line text-black max-[1025px]:text-[6vw] max-md:text-[7.5vw]">
            Every Visit Makes Kyntra Smarter About your Home
          </h2>
        </FocusTextWrap>

        {/* Paragraph far left, nav buttons far right */}
        <div className="flex items-center justify-between gap-[4vw] max-[1025px]:flex-col max-[1025px]:items-start max-[1025px]:gap-6">
          <ParaAnim
            as="p"
            className="text-24 max-w-[40vw] leading-normal  text-black max-[1025px]:max-w-full max-[1025px]:text-[2.6vw] max-md:text-[4vw]"
          >
            Kyntra Keeps Your Appliances, Repairs, Warranties And Maintenance
            History Together So Every Future Job Starts With Context.
          </ParaAnim>

          <CarouselNavButtons
            onPrev={() => sliderRef.current?.goToPrev()}
            onNext={() => sliderRef.current?.goToNext()}
            restColor="#134BD6"
            className="shrink-0"
          />
        </div>
      </div>

      {/* Infinite carousel */}
      <div
        ref={carouselWrapperRef}
        className="relative w-full overflow-hidden pb-14"
      >
        <SmoothInfiniteCarousel
          config={{
            infinite: true,
            snap: true,
            variableWidth: false,
            lerpFactor: 0.12,
            dragSensitivity: 0.005,
          }}
          wrapperClassName="py-2"
          itemClassName="px-[0.95vw] max-[1025px]:px-[1.3vw] max-md:px-[2vw] cursor-grab active:cursor-grabbing"
          onReady={handleReady}
        >
          {CAROUSEL_CARDS.map((card, idx) => {
            const isPrimary = card.variant === "primary";
            return (
              <div
                key={`${card.id}-${idx}`}
                aria-hidden={idx >= SMARTER_CARDS.length}
                className="flex aspect-440/477 w-[28vw] flex-col overflow-hidden rounded-xl p-[2vw] select-none will-change-transform max-[1025px]:w-[50vw] max-md:w-[76vw] max-md:rounded-3xl max-md:p-6"
                style={{
                  backgroundColor: isPrimary ? KYNTRA_PRIMARY : "#0d0d0d",
                  border: isPrimary
                    ? "none"
                    : "1px solid rgba(255,255,255,0.25)",
              
                  color: isPrimary ? "#ffffff" : KYNTRA_PRIMARY,
                }}
              >
                {/* Fixed-height icon zone so every card's heading starts at
                    the same y regardless of title length. */}
                <div className="flex h-[45%] shrink-0 items-start">
                  <Image
                    src={card.icon}
                    alt=""
                    aria-hidden
                    className="h-[3vw] w-[3vw] object-contain max-[1025px]:h-[5.5vw] max-[1025px]:w-[5.5vw] max-md:h-[9vw] max-md:w-[9vw]"
                  />
                </div>

                <div className="flex flex-1 flex-col gap-[1.8vw] max-md:gap-4">
                  <h3 className="font-helvetica-neue text-44 leading-[1.15] font-normal tracking-tight whitespace-pre-line text-white max-[1025px]:text-[4vw] max-md:text-[7vw]">
                    {card.title}
                  </h3>

                  <p className="max-w-[96%] text-22 tracking-wide leading-[1.3] font-normal text-white max-[1025px]:text-[2.5vw] max-md:text-[3.6vw]">
                    {card.description}
                  </p>
                </div>
              </div>
            );
          })}
        </SmoothInfiniteCarousel>
      </div>
    </section>
  );
}
