"use client";
import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import EffectBox from "@/homepage-v3/components/EffectBox";
import LineReveal from "@/components/Animations/LineReveal";
import SplitLine from "@/components/WebsiteComps/SplitLine";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const COLUMNS = [
    [
        {
            title: "Scroll Stack",
            tag: "Scroll Effects",
            action: "Scroll Effects",
            href: "/components",
            media: "/homepage-v3/imgs/1.png",
        },
        {
            title: "Blur Text",
            tag: "Text Animation",
            action: "Scroll Effects",
            href: "/components",
            media: "/homepage-v3/imgs/2.png",
        },
    ],
    [
        {
            title: "WebGL Slider",
            tag: "WebGL",
            action: "Scroll Effects",
            href: "/components",
            media: "/homepage-v3/imgs/3.png",
        },
        {
            title: "Page Flip Transition",
            tag: "Page Transition",
            action: "Scroll Effects",
            href: "/components",
            media: "/homepage-v3/imgs/4.png",
        },
    ],
    [
        {
            title: "Scroll Stack",
            tag: "Scroll Effects",
            action: "Scroll Effects",
            href: "/components",
            media: "/homepage-v3/imgs/5.png",
        },
        {
            title: "Scroll Stack",
            tag: "Scroll Effects",
            action: "Scroll Effects",
            href: "/components",
            media: "/homepage-v3/imgs/6.png",
        },
    ],
];

const PARALLAX_SPEED = [0.05, -0.2, 0.05];

export default function ExploreTheEffects() {
    const container = useRef(null);

    useGSAP(
        () => {
            const mm = gsap.matchMedia();

            mm.add("(min-width: 768px)", () => {
                const columns = gsap.utils.toArray(".explore-effects-column");

                columns.forEach((column, index) => {
                    const speed = PARALLAX_SPEED[index] ?? 0;
                    if (!speed) return;

                    const distance = () => window.innerWidth * speed;

                    gsap.fromTo(
                        column,
                        { y: () => -distance() / 2 },
                        {
                            y: () => distance() / 2,
                            ease: "none",
                            scrollTrigger: {
                                trigger: container.current,
                                start: "top bottom",
                                end: "bottom top",
                                scrub: 1,
                                invalidateOnRefresh: true,
                            },
                        },
                    );
                });
            });

            return () => mm.revert();
        },
        { scope: container },
    );

    return (
        <section
            ref={container}
            id="explore-the-effects"
            className="w-full  my-[20vw] px-[3.5vw] max-md:my-24 max-md:px-[6vw] max-sm:px-[7vw]"
        >
            <div className="space-y-[2vw] max-md:space-y-[8vw] mb-[15vw] ">
                <LineReveal as='h2' className="t96 font-neue-haas w-[60vw] mx-auto text-center max-md:w-full">
                    Explore the Moments Your Website is{" "}
                    <span className="gradient-text-animate">Missing.</span>
                </LineReveal>
                <SplitLine as='p' delay={.25} className="t22 w-[52vw] mx-auto text-center max-md:w-full max-md:text-[2.4vw] max-sm:text-[4vw]">
                    Vault is easiest to understand when you feel it. Preview a few
                    high-impact effects below, then open the full catalogue when you are
                    ready.
                </SplitLine>
            </div>
            <div className="mt-[8vw] flex items-start gap-[1.6vw] max-md:mt-16 max-md:flex-wrap  max-sm:flex-col max-sm:gap-8">
                {COLUMNS.map((column, columnIndex) => (
                    <div
                        key={columnIndex}
                        className="explore-effects-column flex flex-1 flex-col gap-[3vw] max-md:min-w-[45%] max-md:gap-8 max-sm:w-full max-sm:gap-10"
                    >
                        {column.map((effect, effectIndex) => (
                            <EffectBox
                                key={`${columnIndex}-${effectIndex}-${effect.media}`}
                                title={effect.title}
                                tag={effect.tag}
                                action={effect.action}
                                href={effect.href}
                                media={effect.media}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </section>
    );
}
