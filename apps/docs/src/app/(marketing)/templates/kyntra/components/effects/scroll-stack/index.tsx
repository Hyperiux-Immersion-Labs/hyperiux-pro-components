"use client";

import React, { useEffect, useId, useRef } from "react";
import Image, { type StaticImageData } from "next/image";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import CharStaggerPrimaryButton from "../char-stagger-primary-button";

gsap.registerPlugin(ScrollTrigger);

const KYNTRA_PRIMARY = "#134BD6";

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

  accentColor?: string;
  cardRadius?: number;
}

const CARD_H = "26vw";

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

    
     
      const INCOMING = {
        backgroundColor: accentColor,
        color: "#ffffff",
        borderColor: "rgba(255,255,255,0.6)",
        "--card-rule": "rgba(255,255,255,0.25)",
        "--card-fg": "#ffffff",
        "--card-btn-bg": "#ffffff",
        "--card-btn-border": "#ffffff",
        "--card-btn-fg": accentColor,
        "--card-settled": 0,
      };

      const SETTLED = {
        backgroundColor: "#ffffff",
        color: "#000000",
        borderColor: "rgba(0,0,0,0.15)",
        "--card-rule": "rgba(0,0,0,0.18)",
        "--card-fg": "#000000",
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

      gsap.set(cardEls[0], { y: 0 });


      cardEls.slice(1).forEach((card, i) => {
        tl.fromTo(
          card,
          { y: () => window.innerHeight * 1.1 - card.offsetTop },
          { y: 0, ease: "none", duration: 1 },
          i,
        );

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
                      "--card-rule": "rgba(255,255,255,0.25)",
                      "--card-fg": "#ffffff",
                      "--card-btn-bg": "#ffffff",
                      "--card-btn-border": "#ffffff",
                      "--card-btn-fg": accentColor,
                      "--card-settled": 0,
                      borderRadius: `${cardRadius}px`,
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
                      <div className="grid w-[45%] grid-cols-2 gap-y-[2vw] max-[1025px]:w-full max-md:grid-cols-1 max-md:gap-y-[5vw]">
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
                                src={item.icon}
                                alt=""
                                aria-hidden
                                className="w-[2.3vw] h-auto object-contain max-[1025px]:size-[3vw] max-md:size-[6vw]"
                                style={{
                                
                                  filter: "invert(var(--card-settled, 0))",
                                }}
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
                    <div className="flex w-[35%] flex-col items-start gap-[1.8vw] max-[1025px]:w-full max-md:gap-[6vw]">
                      {card.description && (
                        <p className="text-22 w-[85%] leading-normal max-[1025px]:text-[2.4vw] max-md:text-[4.4vw]">
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
