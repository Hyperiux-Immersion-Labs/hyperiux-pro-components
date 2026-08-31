"use client";

import React, { useEffect, useId, useRef } from "react";
import Image, { type StaticImageData } from "next/image";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import CharStaggerPrimaryButton from "../char-stagger-primary-button";
import feature01 from "../../../assets/feature01.svg";
import feature02 from "../../../assets/feature02.svg";
import feature03 from "../../../assets/feature03.svg";
import feature04 from "../../../assets/feature04.svg";

gsap.registerPlugin(ScrollTrigger);

const KYNTRA_PRIMARY = "#134BD6";

/** Shared icon set for every card's item grid, mapped by item index. */
const FEATURE_ICONS: StaticImageData[] = [
  feature01,
  feature02,
  feature03,
  feature04,
];

export interface ScrollStackFeatureItem {
  label: string;
}

export interface ScrollStackCard {
  id: number;
  title: string;
  description?: string;
  items?: ScrollStackFeatureItem[];
  buttonText?: string;
  buttonHref?: string;
}

interface ScrollStackProps {
  cards?: ScrollStackCard[];
  sectionBgColor?: string;
  /** Card background + border-contrast base colour. */
  accentColor?: string;
  cardRadius?: number;
}

/* Every card is the same height (the tall/expanded size). */
const CARD_H = "26vw";
/* The sliver of each older card left visible above the one in front. Cards all
   land in the same place and the stack grows upward: as a new card arrives the
   ones already stacked lift by one sliver each, so the newest card always sits
   at the same spot on screen with the older ones fanned out above it.

   The sliver has to clear the card's whole header band or the incoming card
   crops the title mid-glyph, so it is measured rather than guessed: the card's
   3vw top padding, plus the fixed 44px title, plus a little breathing room. */
const CARD_PAD_TOP_VW = 3;
const CARD_TITLE_PX = 44;
const STACK_SLIVER_PX = 18;
const stackOffset = () =>
  (window.innerWidth * CARD_PAD_TOP_VW) / 100 + CARD_TITLE_PX + STACK_SLIVER_PX;

export default function ScrollStack({
  cards = [],
  sectionBgColor = "#ffffff",
  accentColor = KYNTRA_PRIMARY,
  cardRadius = 28,
}: ScrollStackProps) {
  const uid = useId().replace(/:/g, "");
  const sectionId = `scroll-stack-${uid}`;
  const sectionRef = useRef<HTMLElement>(null);
  const runwayRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    cardRefs.current = cardRefs.current.slice(0, cards.length);

    const mm = gsap.matchMedia(sectionRef);

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const runway = runwayRef.current;
      const cardEls = cardRefs.current.filter(Boolean) as HTMLDivElement[];
      if (!runway || cardEls.length === 0) return;

    
      // The two palettes, declared once so the settle tween can name an explicit
      // start as well as an end. A plain `to` would have to read the start off
      // the element, and GSAP treats unregistered custom properties as opaque
      // strings - those never interpolate and do not reliably snap back when
      // the scrub runs in reverse, which left the icon borders black on the way
      // back up. `fromTo` gives every property a real start value.
      const INCOMING = {
        backgroundColor: accentColor,
        color: "#ffffff",
        borderColor: "rgba(255,255,255,0.6)",
        "--card-rule": "rgba(255,255,255,0.25)",
        "--card-fg": "#ffffff",
        "--card-btn-bg": "#ffffff",
        "--card-btn-border": "#ffffff",
        "--card-btn-fg": accentColor,
        // 0 = incoming (blue), 1 = settled (white). Drives the icon inversion,
        // which cannot be expressed as a colour.
        "--card-settled": 0,
      };

      const SETTLED = {
        backgroundColor: "#ffffff",
        color: "#000000",
        borderColor: "rgba(0,0,0,0.15)",
        "--card-rule": "rgba(0,0,0,0.18)",
        "--card-fg": "#000000",
        // Kept as a colour rather than `transparent`, so it interpolates as one
        // instead of falling back to a discrete string swap.
        "--card-btn-bg": "rgba(255,255,255,0)",
        "--card-btn-border": "#000000",
        "--card-btn-fg": "#000000",
        "--card-settled": 1,
      };

      gsap.set(cardEls, INCOMING);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: runway,
          start: "top 30%",
          end: "bottom bottom",
          scrub: true,
          // markers:true,
          invalidateOnRefresh: true,
        },
      });

      // The first card is simply there when the section arrives - fully legible,
      // heading and content and all - and the rest fly up and stack onto it.
      // Card `index` therefore animates in at timeline slot `index - 1`.
      gsap.set(cardEls[0], { y: 0 });


      cardEls.slice(1).forEach((card, i) => {
        tl.fromTo(
          card,
          { y: () => window.innerHeight * 1.1 - card.offsetTop },
          { y: 0, ease: "none", duration: 1 },
          i,
        );

        // As the incoming card arrives, the one it lands on has reached the top
        // of the stack - recolour that one to the settled (white) state. The
        // incoming card keeps the blue treatment until the next one covers it.
        const settling = cardEls[i];
        tl.fromTo(
          settling,
          INCOMING,
          { ...SETTLED, ease: "power2.out", duration: 0.5 },
          i,
        );

        for (let prevIdx = 0; prevIdx <= i; prevIdx++) {
          const prevCard = cardEls[prevIdx];
          const depth = i + 1 - prevIdx;
          // Cards behind shift up only - no scale. Scaling them made each card
          // in the stack visibly narrower than the one in front of it; the
          // stack should read as same-width cards sitting behind one another.
          tl.to(
            prevCard,
            {
              y: () => -depth * stackOffset(),
              ease: "none",
              duration: 1,
            },
            i,
          );
        }
      });

      tl.to({}, { duration: 0.5 });
    });

    return () => mm.revert();
  }, [cards, accentColor]);

  return (
    <section
      id={sectionId}
      ref={sectionRef}
      className="relative z-10 h-fit w-full"
      style={{ backgroundColor: sectionBgColor }}
    >
      <div
        ref={runwayRef}
        // +1: the first card now has its own entry slot in the timeline, so the
        // runway needs one more card's worth of scroll or every step compresses.
        style={{ height: `${cards.length * 55}svh` }}
        className="w-full motion-reduce:h-auto"
      >
        <div className="sticky top-[10vh] h-[58vw] max-h-[86vh] w-full motion-reduce:static motion-reduce:h-auto">
          <div className="relative mx-auto h-full w-full  motion-reduce:h-auto">
            {cards.map((card, index) => {
              return (
                <div
                  key={card.id}
                  ref={(el) => {
                    cardRefs.current[index] = el;
                  }}
                  style={
                    {
                      zIndex: index + 1,
                      backgroundColor: accentColor,
                      color: "#ffffff",
                      borderColor: "rgba(255,255,255,0.6)",
                      // Declared here, not only in the GSAP set, so the incoming
                      // palette is correct on first paint and under reduced
                      // motion - where the matchMedia branch never runs.
                      "--card-rule": "rgba(255,255,255,0.25)",
                      "--card-fg": "#ffffff",
                      "--card-btn-bg": "#ffffff",
                      "--card-btn-border": "#ffffff",
                      "--card-btn-fg": accentColor,
                      "--card-settled": 0,
                      borderRadius: `${cardRadius}px`,
                      // Every card lands in the same place; the stack grows
                      // upward via the lift tweens, not via staggered `top`.
                      // Seated low in the container so the newest card reads as
                      // centred on screen, with room above for the older ones.
                      top: `calc(50% - ${CARD_H} / 2)`,
                      height: CARD_H,
                    } as React.CSSProperties
                  }
                  className={`absolute inset-x-0 flex flex-col overflow-hidden border px-[2.4vw] py-[3vw] motion-reduce:static motion-reduce:mb-[3vw] motion-reduce:h-auto motion-reduce:translate-y-0 max-md:px-[6vw] max-md:py-[5vw] ${
                    // Card 0 is in place from the start; the rest wait below.
                    index === 0 ? "" : "translate-y-[110vh]"
                  }`}
                >
                  {/* Title row */}
                  <h3 className="text-44 font-normal font-helvetica-neue tracking-[-0.01em] max-[1025px]:text-[3.2vw] max-md:text-[5.2vw]">
                    {card.title}
                  </h3>

                  <div
                    className="my-[1.8vw] h-px w-full max-md:my-[5vw]"
                    style={{
                      backgroundColor:
                        "var(--card-rule, rgba(255,255,255,0.25))",
                    }}
                  />

                  <div className="flex pt-[4vh] items-start justify-between gap-[3vw] max-[1025px]:flex-col max-[1025px]:gap-[4vw]">
                    {card.items && card.items.length > 0 && (
                      <div className="grid w-[40%] grid-cols-2 gap-y-[2vw] max-[1025px]:w-full max-md:grid-cols-1 max-md:gap-y-[5vw]">
                        {card.items.map((item, i) => (
                          <div
                            key={item.label}
                            className={`flex items-center w-[90%] gap-[1.1vw] max-md:gap-[4vw] ${
                              i % 2 === 0
                                ? "border-r pr-[2vw] max-md:border-r-0 max-md:pr-0"
                                : "pl-[2vw] max-md:pl-0"
                            }`}
                            style={{
                              borderColor:
                                "var(--card-rule, rgba(255,255,255,0.25))",
                            }}
                          >
                            <span
                              className="flex size-[3.5vw] shrink-0 items-center justify-center rounded-[0.6vw] border max-[1025px]:size-[6vw] max-md:size-[12vw]"
                              style={{
                                borderColor: "var(--card-fg, #ffffff)",
                              }}
                            >
                              <Image
                                src={FEATURE_ICONS[i % FEATURE_ICONS.length]}
                                alt=""
                                aria-hidden
                                className="size-[1.5vw] w-auto object-contain max-[1025px]:size-[3vw] max-md:size-[6vw]"
                                style={{
                                
                                  filter: "invert(var(--card-settled, 0))",
                                }}
                              />
                            </span>
                            <span className="text-[1.05vw] max-[1025px]:text-[2.4vw] max-md:text-[4.4vw]">
                              {item.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Right: description + CTA */}
                    <div className="flex w-[35%] flex-col items-start gap-[1.8vw] max-[1025px]:w-full max-md:gap-[6vw]">
                      {card.description && (
                        <p className="text-22 leading-normal max-[1025px]:text-[2.4vw] max-md:text-[4.4vw]">
                          {card.description}
                        </p>
                      )}
                      {card.buttonText && (
                        <CharStaggerPrimaryButton
                          text={card.buttonText}
                          href={card.buttonHref ?? "#"}
                          showArrow
                          hoverColor={accentColor}
                          className="rounded-full border px-[1.8vw] py-[0.9vw] max-md:px-[7vw] max-md:py-[4vw]"
                          textClassName="text-[1.05vw] max-[1025px]:text-[2.4vw] max-md:text-[4.4vw]"
                          style={{
                            // On the blue card: white pill, blue text. Once the
                            // card settles to white these vars flip to a black
                            // outline with black text.
                            backgroundColor: "var(--card-btn-bg, #ffffff)",
                            borderColor: "var(--card-btn-border, #ffffff)",
                            color: `var(--card-btn-fg, ${accentColor})`,
                          
                            transitionProperty: "none",
                          }}
                        />
                      )}
                    </div>
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
