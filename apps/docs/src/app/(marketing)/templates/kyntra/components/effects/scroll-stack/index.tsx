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
const FEATURE_ICONS: StaticImageData[] = [feature01, feature02, feature03, feature04];

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

/* Every card is the same height (the tall/expanded size). Stack offset is
   the sliver of each card left visible below the one in front. */
const CARD_H = "26vw";
const STACK_OFFSET = "5vw";

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

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: runway,
          start: "20% 50%",
          end: "bottom bottom",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

    
      cardEls.slice(1).forEach((card, i) => {
        tl.fromTo(
          card,
          { y: () => window.innerHeight * 1.1 - card.offsetTop },
          { y: 0, ease: "none", duration: 1 },
          i,
        );

        for (let prevIdx = 0; prevIdx <= i; prevIdx++) {
          const prevCard = cardEls[prevIdx];
          const depth = i + 1 - prevIdx; 
          const targetScale = Math.max(0.7, 1 - depth * 0.05);
          tl.to(
            prevCard,
            {
              scale: targetScale,
              y: -depth * 14,
              transformOrigin: "center top",
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
        style={{ height: `${cards.length * 55}svh` }}
        className="w-full motion-reduce:h-auto"
      >
        <div className="sticky top-[10vh] h-[58vw] max-h-[86vh] w-full px-[5%] motion-reduce:static motion-reduce:h-auto">
          <div className="relative mx-auto h-full w-full max-w-400 motion-reduce:h-auto">
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
                      borderRadius: `${cardRadius}px`,
                      top: `calc(${index} * ${STACK_OFFSET})`,
                      height: CARD_H,
                    } as React.CSSProperties
                  }
                  className={`absolute inset-x-0 flex flex-col overflow-hidden border border-white/60 px-[2.4vw] py-[1.9vw] motion-reduce:static motion-reduce:mb-[3vw] motion-reduce:h-auto motion-reduce:translate-y-0 max-md:px-[6vw] max-md:py-[5vw] ${
                    index === 0 ? "" : "translate-y-[110vh]"
                  }`}
                >
                  {/* Title row */}
                  <h3 className="text-[2.4vw] font-normal tracking-[-0.01em] text-white max-[1025px]:text-[3.2vw] max-md:text-[5.2vw]">
                    {card.title}
                  </h3>

                  <div className="my-[1.8vw] h-px w-full bg-white/25 max-md:my-[5vw]" />

                  <div className="flex pt-[3vh] items-start justify-between gap-[3vw] max-[1025px]:flex-col max-[1025px]:gap-[4vw]">
                   
                    {card.items && card.items.length > 0 && (
                      <div className="grid w-[50%] grid-cols-2 gap-y-[2vw] max-[1025px]:w-full max-md:grid-cols-1 max-md:gap-y-[5vw]">
                        {card.items.map((item, i) => (
                          <div
                            key={item.label}
                            className={`flex items-center w-[80%] gap-[1.1vw] max-md:gap-[4vw] ${
                              i % 2 === 0
                                ? "border-r border-white/25 pr-[2vw] max-md:border-r-0 max-md:pr-0"
                                : "pl-[2vw] max-md:pl-0"
                            }`}
                          >
                            <span className="flex size-[3.5vw] shrink-0 items-center justify-center rounded-[0.6vw] border border-white max-[1025px]:size-[6vw] max-md:size-[12vw]">
                              <Image
                                src={FEATURE_ICONS[i % FEATURE_ICONS.length]}
                                alt=""
                                aria-hidden
                                className="size-[1.5vw] w-auto object-contain max-[1025px]:size-[3vw] max-md:size-[6vw]"
                              />
                            </span>
                            <span className="text-[1.05vw] text-white max-[1025px]:text-[2.4vw] max-md:text-[4.4vw]">
                              {item.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Right: description + CTA */}
                    <div className="flex w-[35%] flex-col items-start gap-[1.8vw] max-[1025px]:w-full max-md:gap-[6vw]">
                      {card.description && (
                        <p className="text-[1.05vw] leading-normal text-white max-[1025px]:text-[2.4vw] max-md:text-[4.4vw]">
                          {card.description}
                        </p>
                      )}
                      {card.buttonText && (
                        <CharStaggerPrimaryButton
                          text={card.buttonText}
                          href={card.buttonHref ?? "#"}
                          showArrow
                          hoverColor={accentColor}
                          className="rounded-full bg-white px-[1.8vw] py-[0.9vw] max-md:px-[7vw] max-md:py-[4vw]"
                          textClassName="text-[1.05vw] text-black max-[1025px]:text-[2.4vw] max-md:text-[4.4vw]"
                          iconClassName="text-black"

                          style={{ color: accentColor }}
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

