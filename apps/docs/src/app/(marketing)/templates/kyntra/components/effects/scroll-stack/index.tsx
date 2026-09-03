"use client";

import React, { useEffect, useId, useRef } from "react";
import Image, { type StaticImageData } from "next/image";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";

import CharStaggerPrimaryButton from "../char-stagger-primary-button";

gsap.registerPlugin(ScrollTrigger);

// Cards are a flat white surface; nothing recolours on scroll. Kyntra's
// primary carries the heading, the icon tiles and the CTA.
const KYNTRA_PRIMARY = "#134BD6";
const CARD_BG = "#ffffff";
const CARD_FG = "#000000";
const CARD_RULE = "rgba(0,0,0,0.18)";

export interface ScrollStackFeatureItem {
  label: string;
  icon: StaticImageData;
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
  cardRadius?: number;
}

const MOBILE_BP = 1025;
const PHONE_BP = 768;

// The peeking strip above each settled card is one title line plus a sliver.
// The desktop numbers are absolute px, which read as a cramped band once the
// viewport narrows, so below the breakpoint each part scales with the width.
const CARD_PAD_TOP_VW = 3;
const CARD_TITLE_PX = 44;
const STACK_SLIVER_PX = 18;

const MOBILE_PAD_TOP_VW = 5;
const MOBILE_TITLE_VW = 7;
const MOBILE_SLIVER_VW = 3;

const PHONE_PAD_TOP_VW = 7;
const PHONE_TITLE_VW = 9;
const PHONE_SLIVER_VW = 4;

// How far down the viewport an incoming card starts, as a fraction of the
// viewport height. Also drives the pre-hydration resting place via the
// --card-entry custom property, so the two stay in sync.
const CARD_ENTRY_VH = 0.9;

const SCROLL_DISTANCE_PER_CARD_SVH = 90;
const STICKY_VIEWPORT_RESERVE_SVH = 95;

const stackOffset = () => {
  const w = window.innerWidth;
  if (w <= PHONE_BP) {
    return (w * (PHONE_PAD_TOP_VW + PHONE_TITLE_VW + PHONE_SLIVER_VW)) / 100;
  }
  if (w <= MOBILE_BP) {
    return (
      (w * (MOBILE_PAD_TOP_VW + MOBILE_TITLE_VW + MOBILE_SLIVER_VW)) / 100
    );
  }
  return (w * CARD_PAD_TOP_VW) / 100 + CARD_TITLE_PX + STACK_SLIVER_PX;
};

export default function ScrollStack({
  cards = [],
  sectionBgColor = "#ffffff",
  cardRadius = 28,
}: ScrollStackProps) {
  const uid = useId().replace(/:/g, "");
  const sectionId = `scroll-stack-${uid}`;
  const transitionCount = Math.max(cards.length - 1, 1);
  const sectionRef = useRef<HTMLElement>(null);
  const runwayRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    cardRefs.current = cardRefs.current.slice(0, cards.length);

    const mm = gsap.matchMedia(sectionRef);

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const runway = runwayRef.current;
      const sticky = stickyRef.current;
      const cardEls = cardRefs.current.filter(Boolean) as HTMLDivElement[];
      if (!runway || !sticky || cardEls.length === 0) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: runway,
          start: "top 5%",
          // Finish exactly when CSS sticky releases the card viewport.
          end: () => {
            const stickyTop = Number.parseFloat(
              window.getComputedStyle(sticky).top,
            );
            return `bottom ${sticky.offsetHeight + (stickyTop || 0)}px`;
          },
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      gsap.set(cardEls[0], { y: 0 });

      cardEls.slice(1).forEach((card, i) => {
        tl.fromTo(
          card,
          { y: () => window.innerHeight * CARD_ENTRY_VH - card.offsetTop },
          { y: 0, ease: "none", duration: 1 },
          i,
        );

        for (let prevIdx = 0; prevIdx <= i; prevIdx++) {
          const prevCard = cardEls[prevIdx];
          const depth = i + 1 - prevIdx;
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
    });

    return () => mm.revert();
  }, [cards]);

  return (
    <section
      id={sectionId}
      ref={sectionRef}
      className="relative z-10 h-fit w-full"
      style={{ backgroundColor: sectionBgColor }}
    >
      <div
        ref={runwayRef}
        style={{
          height: `${transitionCount * SCROLL_DISTANCE_PER_CARD_SVH + STICKY_VIEWPORT_RESERVE_SVH}svh`,
        }}
        className="w-full motion-reduce:h-auto"
      >
        <div
          ref={stickyRef}
          className="sticky top-25 h-[80vw] max-h-[86vh] w-full motion-reduce:static motion-reduce:h-auto max-[1025px]:top-[24vw] max-[1025px]:h-[70vh] max-[1025px]:max-h-none max-md:top-[32vw] max-md:h-[82vh]"
        >
          <div className="relative mx-auto h-full w-full motion-reduce:h-auto">
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
                      backgroundColor: CARD_BG,
                      color: CARD_FG,
                      borderColor: CARD_FG,
                      borderRadius: `${cardRadius}px`,
                      "--card-entry": `${CARD_ENTRY_VH * 100}vh`,
                    } as React.CSSProperties
                  }
                  className={`absolute inset-x-0 flex h-[26vw] flex-col overflow-hidden border px-[2.4vw] py-[3vw] max-[1025px]:py-[6vh] top-25 motion-reduce:static motion-reduce:mb-[3vw] motion-reduce:h-auto motion-reduce:translate-y-0 max-[1025px]:pt-[5vh] max-[1025px]:top-[calc(50%-35vh)] max-[1025px]:h-[72vh] max-[1025px]:px-[5vw] max-md:top-0 max-md:h-auto max-md:max-h-[82vh] max-md:px-[6vw] max-md:pt-[7vw] max-md:pb-[7vw] ${
                    // Card 0 is in place from the start; the rest wait below.
                    index === 0 ? "" : "translate-y-(--card-entry)"
                  }`}
                >
                  <h3
                    className="text-44 font-normal font-helvetica-neue tracking-[-0.01em] max-[1025px]:text-[4.4vw] max-md:text-[6.4vw] max-[1025px]:mb-[5vw]"
                    style={{ color: KYNTRA_PRIMARY }}
                  >
                    {card.title}
                  </h3>

                  <div
                    className="my-[1.8vw] max-[1025px]:hidden h-px w-full"
                    style={{ backgroundColor: CARD_RULE }}
                  />

                  <div className="flex pt-[4vh] items-start justify-between gap-[3vw] max-[1025px]:min-h-0 max-[1025px]:flex-1 max-[1025px]:flex-col max-[1025px]:gap-[5vw] max-[1025px]:pt-0 max-md:overflow-y-auto">
                    {card.items && card.items.length > 0 && (
                      <div className="grid w-[45%] grid-cols-2 gap-y-[2vw] max-[1025px]:order-2 max-[1025px]:w-full max-[1025px]:grid-cols-1 max-[1025px]:gap-y-0">
                        {card.items.map((item, i) => (
                          <div
                            key={item.label}
                            className={`flex items-center w-[90%] gap-[1.1vw] max-[1025px]:w-[70%] max-[1025px]:gap-[3vw] max-[1025px]:py-[2.4vw] max-[1025px]:pr-0 max-[1025px]:pl-0 max-md:w-[85%] max-md:gap-[4vw] max-md:py-[2.5vw] ${
                              i % 2 === 0
                                ? "border-r pr-[2vw] max-[1025px]:border-r-0"
                                : "pl-[2vw]"
                            } ${i === 0 ? "" : "max-[1025px]:border-t"}`}
                            style={{ borderColor: CARD_RULE }}
                          >
                            <span
                              className="flex size-[3.5vw] shrink-0 items-center justify-center rounded-[0.6vw] max-[1025px]:rounded-md max-[1025px]:size-[6vw] max-md:size-[12vw]"
                              style={{ backgroundColor: KYNTRA_PRIMARY }}
                            >
                              {/* The source SVGs are already drawn
                                  fill="white", so they read as-is on the
                                  primary tile - no filter needed. */}
                              <Image
                                src={item.icon}
                                alt=""
                                aria-hidden
                                className="w-[2.3vw] h-auto object-contain max-[1025px]:size-[3vw] max-md:size-[6vw]"
                              />
                            </span>
                            <span className="text-22 max-[1025px]:text-[2.4vw] max-md:text-[4.4vw]">
                              {item.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Right: description + CTA */}
                    <div className="flex w-[35%] flex-col items-start gap-[1.8vw] max-[1025px]:contents">
                      {card.description && (
                        <p className="text-22 w-[85%] leading-normal max-[1025px]:order-1 max-[1025px]:w-full max-[1025px]:text-[2.9vw] max-md:text-[4.4vw]">
                          {card.description}
                        </p>
                      )}
                      {card.buttonText && (
                        <CharStaggerPrimaryButton
                          text={card.buttonText}
                          href={card.buttonHref ?? "#"}
                          showArrow
                          // Label stays white on hover; the char-stagger and
                          // arrow motion carry the affordance.
                          hoverColor={CARD_BG}
                          className="rounded-full px-[1.8vw] py-[0.9vw] max-[1025px]:order-3 max-[1025px]:mt-auto max-[1025px]:self-start max-[1025px]:px-[6vw] max-[1025px]:py-[2.6vw] max-md:px-[7vw] max-md:py-[4vw]"
                          textClassName="text-[1.05vw] max-[1025px]:text-[2.4vw] max-md:text-[4.4vw]"
                          style={{
                            backgroundColor: KYNTRA_PRIMARY,
                            color: CARD_BG,
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
