// Built using Hyperiux Vault: https://vault.hyperiux.com
"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import SmoothInfiniteCarousel, {
  type KeyboardSlider,
} from "./smooth-carousel/SmoothInfiniteCarousel";
import CarouselNavButtons from "./Buttons/NavButtons";

import FocusTextWrap from "./effects/focus-text/wrap";
import { ParaAnim } from "./Animations/gsapAnim";
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const KYNTRA_PRIMARY = "#134BD6";

export interface SmarterCardData {
  id: number;
  title: string;
  description: string;
  variant: "primary" | "dark";
}

const SMARTER_CARDS: SmarterCardData[] = [
  {
    id: 1,
    title: "Home\nMemory",
    description:
      "Appliances, warranties, repairs and important home details stay organised in one living record.",
    variant: "primary",
  },
  {
    id: 2,
    title: "Maintenance, Before\nThe Breakdown",
    description:
      "Kyntra tracks upcoming maintenance and reminds you before small issues become bigger problems.",
    variant: "dark",
  },
  {
    id: 3,
    title: "One Tap To Get It\nHandled",
    description:
      "Describe what's wrong. Kyntra identifies the service, shows the cost and finds the right professional.",
    variant: "primary",
  },
  {
    id: 4,
    title: "The Job,\nDone Right",
    description:
      "Every visit, part and invoice is recorded, so the fix becomes part of your home's permanent history.",
    variant: "dark",
  },
  {
    id: 5,
    title: "Context That\nCompounds",
    description:
      "The more Kyntra learns about your home, the sharper every future recommendation becomes.",
    variant: "primary",
  },
  {
    id: 6,
    title: "One Place For\nEvery Pro",
    description:
      "Trusted technicians, past ratings and repeat bookings all live in a single connected view.",
    variant: "dark",
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
      if (!carouselWrapperRef.current) return;

      const cardElements =
        carouselWrapperRef.current.querySelectorAll(".smarter-card-anim");

      gsap.set(cardElements, { y: 130, autoAlpha: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: carouselWrapperRef.current,
          start: "top 82%",
          once: true,
        },
      });

      tl.to(
        cardElements,
        {
          y: 0,
          autoAlpha: 1,
          duration: 1.45,
          stagger: 0.1,
          ease: "power4.out",
          onComplete: () => {
            gsap.set(cardElements, { clearProps: "y,opacity,visibility" });
          },
        },
        0,
      );
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
                className="smarter-card-anim flex aspect-440/477 w-[28vw] flex-col overflow-hidden rounded-xl p-[2vw] select-none will-change-transform max-[1025px]:w-[50vw] max-md:w-[76vw] max-md:rounded-3xl max-md:p-6"
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
                  <DatabaseIcon className="h-[5vw] w-[5vw] max-[1025px]:h-[7vw] max-[1025px]:w-[7vw] max-md:h-[11vw] max-md:w-[11vw]" />
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

function DatabaseIcon({ className = "" }: { className?: string }) {
  // Stacked-cylinder "database" glyph. Fills with currentColor so the card
  // controls it (white on primary cards, Kyntra primary on dark cards).
  return (
    <svg
      viewBox="0 0 99 99"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path d="M49.416 72.9954C62.0991 72.9954 72.3808 67.12 72.3808 59.8726V72.9954C72.3808 80.2428 62.0991 86.118 49.416 86.118C36.7329 86.118 26.4512 80.2428 26.4512 72.9954V59.8726C26.4512 67.12 36.7329 72.9954 49.416 72.9954Z" />
      <path d="M49.416 55.7717C62.0991 55.7717 72.3808 49.8964 72.3808 42.6489V55.7717C72.3808 63.0192 62.0991 68.8944 49.416 68.8944C36.7329 68.8944 26.4512 63.0192 26.4512 55.7717V42.6489C26.4512 49.8964 36.7329 55.7717 49.416 55.7717Z" />
      <path d="M69.3086 31.9869C71.2625 30.0567 72.3808 27.8157 72.3808 25.4255C72.3808 18.178 62.0991 12.3027 49.416 12.3027C36.7329 12.3027 26.4512 18.178 26.4512 25.4255C26.4512 27.8157 27.5695 30.0567 29.5235 31.9869C33.4942 28.0644 40.9158 25.4255 49.416 25.4255C57.9163 25.4255 65.3378 28.0644 69.3086 31.9869Z" />
      <path d="M49.416 38.5481C62.0991 38.5481 72.3808 32.6727 72.3808 25.4253V38.5481C72.3808 45.7955 62.0991 51.6708 49.416 51.6708C36.7329 51.6708 26.4512 45.7955 26.4512 38.5481V25.4253C26.4512 32.6727 36.7329 38.5481 49.416 38.5481Z" />
    </svg>
  );
}
