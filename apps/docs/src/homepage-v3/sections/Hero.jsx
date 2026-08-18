"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import SplitText from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

import CubeBackgroundAscii from "../components/CubeBackgroundAscii";
import ButtonV3 from "../components/ButtonV3";
import { useLoaderV3Complete } from "../components/loader-v3-state";
import { prefersReducedMotion } from "@/lib/motion";
import { unlockScrollV3, useScrollLockLenis } from "../components/scroll-lock-v3";
import { useFadeIn, useFadeUp } from "@/components/Animations/gsapAnimations";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger, SplitText);
}

const NAV_LEAD = 0.25;
const AT_CANVAS = 0;
const INTRO_DURATION = 1.7;
const AT_HEADING = 1.7;
const AT_COPY = 2.3;
const AT_ACTIONS = 2.75;

export default function Hero() {
    const rootRef = useRef(null);
    const layerRef = useRef(null);
    const overlayRef = useRef(null);
    const canvasRef = useRef(null);
    const headingRef = useRef(null);
    const copyRef = useRef(null);
    const actionsRef = useRef(null);
    const loaderComplete = useLoaderV3Complete();

    useScrollLockLenis();

    const introRef = useRef(0);

    useGSAP(
        () => {
            if (prefersReducedMotion()) {
                introRef.current = 1;
                return;
            }
            gsap.set(
                [headingRef.current, copyRef.current, actionsRef.current],
                { autoAlpha: 0 }
            );
        },
        { scope: rootRef }
    );

    useGSAP(
        () => {
            if (!loaderComplete || prefersReducedMotion()) return;

            const heading = SplitText.create(headingRef.current, {
                type: "words",
                mask: "words",
            });
            const copy = SplitText.create(copyRef.current, { type: "lines" });

            headingRef.current
                ?.querySelectorAll(".gradient-text-animate")
                .forEach((el) => {
                    const nested = heading.words.filter((word) => el.contains(word));
                    if (!nested.length) return;
                    nested.forEach((word) =>
                        word.classList.add("gradient-text-animate"),
                    );
                    el.classList.remove("gradient-text-animate");
                });

            gsap.set([headingRef.current, copyRef.current], { autoAlpha: 1 });
            gsap.set(heading.words, { yPercent: 110 });
            gsap.set(copy.lines, { yPercent: 40, autoAlpha: 0 });
            gsap.set(actionsRef.current, { y: 28, autoAlpha: 0 });

            const tl = gsap.timeline({
                delay: NAV_LEAD,
                defaults: { ease: "power2.out" },
            });

            tl.to(
                introRef,
                { current: 1, duration: INTRO_DURATION, ease: "power1.inOut" },
                AT_CANVAS
            )
                .to(
                    heading.words,
                    { yPercent: 0, duration: 1.1, stagger: 0.08 },
                    AT_HEADING
                )
                .to(
                    copy.lines,
                    { yPercent: 0, autoAlpha: 1, duration: 0.8, stagger: 0.07 },
                    AT_COPY
                )
                .to(
                    actionsRef.current,
                    {
                        y: 0,
                        autoAlpha: 1,
                        duration: 0.7,
                        onComplete: unlockScrollV3,
                    },
                    AT_ACTIONS
                );

            return () => {
                heading.revert();
                copy.revert();
                unlockScrollV3();
            };
        },
        { dependencies: [loaderComplete], scope: rootRef }
    );

    useGSAP(
        () => {
            if (prefersReducedMotion()) return;
            const mm = gsap.matchMedia();

            const recede = (blur) => {
                gsap
                    .timeline({
                        defaults: { ease: "none" },
                        scrollTrigger: {
                            start: 0,
                            end: () => window.innerHeight * 0.9,
                            scrub: true,
                            invalidateOnRefresh: true,
                        },
                    })
                    .fromTo(
                        layerRef.current,
                        { scale: 1, rotate: 0, filter: "blur(0px)" },
                        { scale: 0.7, rotate: '5deg', filter: `blur(${blur}px)` },
                        0
                    )
                    .fromTo(overlayRef.current, { opacity: 0 }, { opacity: 0.65 }, 0);
            };

            mm.add("(min-width: 768px)", () => recede(14));
            mm.add("(max-width: 767px)", () => recede(6));

            return () => mm.revert();
        },
        { scope: rootRef }
    );

    useFadeUp()

    return (
        <main
            ref={rootRef}
            className="relative h-dvh w-screen overflow-hidden bg-background"
        >
            <div ref={layerRef} className="absolute  inset-0 origin-center max-md:w-full will-change-transform">
                <div ref={canvasRef} className="absolute inset-0 will-change-transform">
                    <CubeBackgroundAscii intro={introRef} />
                </div>
                <div className="pointer-events-none max-md:w-full absolute inset-0 z-10 flex items-end pb-[11vw] p-[3vw] max-[1025px]:p-[6vw] max-md:items-end max-md:p-6 max-sm:p-5">
                    <div className="space-y-[3vw] relative z-10 w-full max-[1025px]:space-y-[4vw] max-md:space-y-8 max-sm:space-y-11">
                        <div className="flex flex-col h-fit font-neue-haas w-full items-start max-sm:gap-2 max-md:gap-5">
                            <h1 ref={headingRef} className="relative max-md:text-[13vw]! t96 mt-[1vw] w-[55vw] max-[1025px]:mt-0 max-[1025px]:w-[85%] max-md:mt-0 max-md:w-[85%] max-sm:w-full">
                                The Interaction Layer your Website is <span className="gradient-text-animate">Missing.</span>
                            </h1>
                        </div>

                        <p ref={copyRef} className="t22 text-secondary w-[42vw] max-[1025px]:w-[75%] max-md:w-[80%] max-sm:w-full max-md:text-left max-sm:text-left">
                          Source-first scroll systems, cursor effects, text reveals, page transitions, loaders, backgrounds, and WebGL scenes for React and Next.js. Installed as real files in your project, not a dependency you rent.
                        </p>

                        <div
                            ref={actionsRef}
                            className="pointer-events-auto flex max-sm:pt-4 max-sm:flex-col w-fit max-sm:w-full gap-[1vw] max-[1025px]:gap-[2.5vw] max-md:pb-[5vw] max-md:w-full max-md:gap-5"
                        >
                            <ButtonV3
                                text="Read Docs"
                                href="/docs"
                                variant="outline"
                                className="max-sm:w-full max-sm:justify-center"
                            />
                            <ButtonV3
                                text="Browser All Effects"
                                      href="/effects"
                                variant="orange"
                                scrollOffset={-1000}
                                className="max-sm:w-full max-sm:justify-center"
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div
                ref={overlayRef}
                className="pointer-events-none absolute inset-0 z-20 bg-background opacity-0"
            />
        </main>
    );
}
