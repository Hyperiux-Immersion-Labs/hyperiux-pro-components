"use client";

import React, { useEffect, useId, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import SplitTextLines from "./effects/split-text-lines/SplitTextLines";

gsap.registerPlugin(ScrollTrigger);

export interface TreatmentCard {
    id: number;
    title: string;
    tags: string[];
    description: string;
    bgColor: string;
}

const TREATMENTS_DATA: TreatmentCard[] = [
    {
        id: 1,
        title: "Teeth\nWhitening",
        tags: ["Advanced brightening", "Stain removal", "Instant results"],
        description:
            "Professional teeth whitening treatments utilize safe, high-grade bleaching agents activated by specialized light technology to lift years of deep stains, restoring brilliant natural radiance in a single comfortable visit.",
        bgColor: "#13314a",
    },
    {
        id: 2,
        title: "Dental\nImplants",
        tags: ["Permanent solution", "Natural appearance", "Long-term care"],
        description:
            "Dental implants are titanium posts surgically placed into the jawbone to serve as artificial tooth roots. Once healed, they support custom crowns that look, feel, and function like natural teeth, restoring your ability to eat, speak, and smile with full confidence.",
        bgColor: "#3365e2",
    },
    {
        id: 3,
        title: "Orthodontics \n& Aligners",
        tags: ["Custom fit", "Discreet alignment", "Gentle movement"],
        description:
            "Clear aligners and modern orthodontic options gently guide teeth into optimal alignment over time. Designed for discreet comfort and easy maintenance throughout your daily routine.",
        bgColor: "#13314a",
    },
    // {
    //     id: 4,
    //     title: "Restorative\nCrowns & Veneers",
    //     tags: ["Porcelain aesthetics", "Precision contouring", "Durable strength"],
    //     description:
    //         "High-precision porcelain veneers and crowns custom-crafted to repair chips, gaps, and wear, giving you seamless aesthetics with unmatched durability and natural feel.",
    //     bgColor: "#3365e2",
    // },
    // {
    //     id: 5,
    //     title: "Comprehensive\nPeriodontal Care",
    //     tags: ["Deep cleaning", "Gum revitalization", "Preventative therapy"],
    //     description:
    //         "Targeted therapies focused on protecting gum tissue and underlying bone structure, halting progression of gum disease and ensuring a strong foundation for lifelong oral wellness.",
    //     bgColor: "#13314a",
    // },
];

export default function DentalTreatments({
    cards = TREATMENTS_DATA,
}: {
    cards?: TreatmentCard[];
}) {
    const uid = useId().replace(/:/g, "");
    const sectionId = `dental-treatments-${uid}`;
    const sectionRef = useRef<HTMLElement>(null);
    const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        rowRefs.current = rowRefs.current.slice(0, cards.length);
        cardRefs.current = cardRefs.current.slice(0, cards.length);

        if (globalThis.innerWidth <= 1025) {
            cardRefs.current.filter(Boolean).forEach((card) => {
                gsap.set(card, {
                    autoAlpha: 1,
                    scale: 1,
                });
            });
            return undefined;
        }

        const ctx = gsap.context(() => {
            const reduceMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;

            const currentCards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
            const currentRows = rowRefs.current.filter(Boolean) as HTMLDivElement[];

            currentCards.forEach((card, index) => {
                gsap.set(card, {
                    autoAlpha: 1,
                    scale: reduceMotion || index === 0 ? 1 : 1.08,
                    transformOrigin: "center center",
                });
            });

            currentCards.slice(0, -1).forEach((card, index) => {
                const nextRow = currentRows[index + 1];
                const nextCard = currentCards[index + 1];

                if (!nextRow || !nextCard) return;

                const handoff = gsap.timeline({
                    scrollTrigger: {
                        trigger: nextRow,
                        start: "top bottom+=20%",
                        end: "top top-=28%",
                        scrub: true,
                        invalidateOnRefresh: true,
                    },
                });

                if (!reduceMotion) {
                    handoff.to(
                        nextCard,
                        {
                            scale: 1,
                            ease: "none",
                        },
                        0
                    );
                }

                gsap.to(card, {
                    autoAlpha: 0,
                    ease: "none",
                    scrollTrigger: {
                        trigger: nextRow,
                        start: "top top+=14%",
                        end: "top top+=2%",
                        scrub: true,
                        invalidateOnRefresh: true,
                    },
                });
            });

            ScrollTrigger.refresh();
        }, sectionRef);

        return () => {
            ctx.revert();
        };
    }, [cards]);

    return (
        <section
            id={sectionId}
            ref={sectionRef}
            className="w-full bg-white h-fit relative z-10 pt-[6vw] pb-[10vw] max-md:pb-[20vw]"
        >
            {/* Header Section */}
            <div className="oris-paddx mb-[5vw] max-md:mb-[15vw] max-[1025px]:mb-[10vw]">
                <SplitTextLines as="h2" className="text-[4.2vw] max-[1025px]:text-[6vw] max-md:text-[7.5vw]">
                    Dental Care Treatments
                </SplitTextLines>
                <SplitTextLines as="p" className="oris-text22 mt-[1.5vw]" delay={0.15}>
                    Personalized care designed for every stage of dental health.
                </SplitTextLines>
            </div>

            {/* Scroll Stack Container */}
            <div className="w-full flex flex-col gap-[20vw] items-center oris-paddx max-md:gap-[70vw]">
                {cards.map((item, index) => (
                    <div
                        key={item.id}
                        ref={(el) => {
                            rowRefs.current[index] = el;
                        }}
                        style={{ zIndex: index + 1 }}
                        className={`sticky top-[18%] h-[40vw] w-full max-md:h-[120vw] max-[1025px]:h-[90vw]`}
                    >

                            <div
                                ref={(el) => {
                                    cardRefs.current[index] = el;
                                }}
                                className="w-full h-full rounded-[2.2vw] max-[1025px]:rounded-[24px] p-[3.5vw] max-[1025px]:p-[6vw] flex flex-col max-[1025px]:gap-[10vw] justify-between"
                                style={{ backgroundColor: item.bgColor }}
                            >
                                {/* Top: Title & Tags */}
                                <div>
                                    <h3 className="text-white text-[6vw] max-[1025px]:text-[8vw] leading-[1.2]! whitespace-pre-line">
                                        {item.title}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-[0.6vw] max-[1025px]:gap-[1.5vw] text-white oris-text22 mt-[1.6vw] max-[1025px]:mt-[8vw]">
                                        {item.tags.map((tag, tagIdx) => (
                                            <React.Fragment key={tagIdx}>
                                                <span>{tag}</span>
                                                {tagIdx < item.tags.length - 1 && (
                                                    <span className="w-[0.3vw] h-[0.3vw] max-[1025px]:w-[1vw] max-[1025px]:h-[1vw] rounded-full bg-white inline-block" />
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </div>

                                {/* Bottom: Description */}
                                <div>
                                    <p className="text-white oris-text32 max-w-[65vw] max-[1025px]:max-w-full">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                       
                    </div>
                ))}
            </div>
        </section>
    );
}
