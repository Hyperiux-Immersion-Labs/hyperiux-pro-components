// Built using Hyperiux Vault: https://vault.hyperiux.com
"use client";

import { useEffect, useRef } from "react";
import Image, { type StaticImageData } from "next/image";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";

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

export default function Smarter() {
  const sectionRef = useRef<HTMLElement | null>(null);
  // The 200vh spacer: its scroll length is what the horizontal travel is
  // scrubbed against, so a taller spacer means a slower card sweep.
  const scrollRangeRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ctx = gsap.context(() => {
      const track = trackRef.current;
      const scrollRange = scrollRangeRef.current;
      if (!track || !scrollRange) return;

      if (prefersReducedMotion()) {
        gsap.set(track, { x: 0, xPercent: 0 });
        return;
      }

    
      const overflow = () => {
        const viewport = track.parentElement;
        if (!viewport) return 0;
        return Math.max(0, track.scrollWidth - viewport.clientWidth);
      };


      gsap.fromTo(
        track,
        { xPercent: 70 },
        {
          xPercent: 0,
          x: () => -overflow(),
          ease: "none",
          scrollTrigger: {
            trigger: scrollRange,
            start: "top 60%",
            end: "bottom bottom",
            scrub: 0.5,
            invalidateOnRefresh: true,
            // markers: true,
          },
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="smarter"
      ref={sectionRef}
      className="relative z-10 w-full bg-white"
    >
      {/* Scroll range: the sticky viewport below stays put for its length
          while the card track is scrubbed sideways. Header rides along inside
          it so the copy stays on screen for the whole sweep. */}
      <div ref={scrollRangeRef} className="relative h-[150vh]">
        <div className="sticky top-0 flex h-screen w-full flex-col justify-center gap-[4vw] overflow-hidden max-[1025px]:gap-[6vw] max-md:gap-10">
          {/* Header */}
          <div className="mx-auto flex w-full max-w-400 shrink-0 flex-col gap-[2vw] px-[5%] max-[1025px]:px-[7%] max-md:gap-8">
            <FocusTextWrap>
              <h2 className="font-helvetica-neue w-[60%] max-[1025px]:w-full leading-[1.1] font-normal tracking-[-0.02em] whitespace-pre-line text-black ">
                Every Visit Makes Kyntra Smarter About your Home
              </h2>
            </FocusTextWrap>

            <div className="flex items-center justify-between gap-[4vw] max-[1025px]:flex-col max-[1025px]:items-start max-[1025px]:gap-6">
              <ParaAnim
                as="p"
                className="text-24 max-w-[40vw] leading-normal  text-black max-[1025px]:max-w-full max-[1025px]:text-[2.6vw] max-md:text-[4vw]"
              >Kyntra keeps your appliances, repairs, warranties and maintenance history together so every future job starts with context.
              </ParaAnim>
            </div>
          </div>

          <div
            ref={trackRef}
            className="flex w-max shrink-0 gap-[1.9vw] px-[5%] max-[1025px]:gap-[4.4vw] max-[1025px]:px-[7%] max-md:gap-[7vw] max-md:px-[9%] will-change-transform"
          >
            {SMARTER_CARDS.map((card) => {
              const isPrimary = card.variant === "primary";
              return (
                <div
                  key={card.id}
                  className="flex aspect-440/477 max-[1025px]:aspect-auto max-[1025px]:h-[42vh] w-[28vw] shrink-0 flex-col overflow-hidden rounded-xl p-[2vw] max-[1025px]:p-[4vw] select-none will-change-transform max-[1025px]:w-[50vw] max-md:w-[76vw] max-md:rounded-3xl max-md:p-6"
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
                  <div className="flex h-[45%] max-[1025px]:h-[40%] shrink-0 items-start">
                    <Image
                      src={card.icon}
                      alt=""
                      aria-hidden
                      className="h-[3vw] w-[3vw] object-contain max-[1025px]:h-[5.5vw] max-[1025px]:w-[5.5vw] max-md:h-[12vw] max-md:w-[12vw]"
                    />
                  </div>

                  <div className="flex flex-1 flex-col gap-[1.8vw] max-md:gap-6">
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
          </div>
        </div>
      </div>
    </section>
  );
}
