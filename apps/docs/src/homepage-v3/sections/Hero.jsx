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
import { useFadeIn, useFadeUp } from "@/components/Animations/gsapAnimations";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger, SplitText);
}

const NAV_LEAD = 0.25;
// Order of the intro is: the ASCII field arrives, then the navbar drops in,
// then the copy. Each beat below is a start time inside that sequence.
//
// The loader announces itself complete as its own field starts bursting
// outward, not after — so the cube resolves in underneath while those glyphs
// are still crossing the screen, and the two ASCII fields read as one handing
// over. Holding this until after the loader has gone breaks that join.
const AT_CANVAS = 0;
const INTRO_DURATION = 1.7;
// Copy waits out the field and the navbar (NavbarV3's own INTRO_DELAY_MS),
// so the three arrive in sequence rather than on top of each other.
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

    // Drives the ASCII field's own entry reveal, mutated by GSAP and read by
    // the shader every frame. Starts at 0 — nothing drawn — which is what holds
    // the field back instead of a fade on the canvas element: fading the
    // element would bring the whole grid up as one sheet, and the point here is
    // that cells arrive individually.
    const introRef = useRef(0);

    // Hidden from the first client frame — the loader panel is already covering
    // the page at this point, so nothing flashes before the intro plays.
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

            // SplitText moves glyphs into word nodes; keep gradient clip on those nodes.
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

            // Every start value is parked up front, so the timeline below is
            // nothing but .to() — the resting state of the hero is one block
            // you can read, instead of being spread across five `from` objects.
            // The containers can come up straight away: the heading's words are
            // masked and pushed out of frame, and the copy's lines are still
            // transparent, so there is nothing to see yet.
            gsap.set([headingRef.current, copyRef.current], { autoAlpha: 1 });
            gsap.set(heading.words, { yPercent: 110 });
            gsap.set(copy.lines, { yPercent: 40, autoAlpha: 0 });
            // Fixed px rather than a percentage on the buttons: the stack goes
            // column on mobile, where a percentage would throw them off screen.
            gsap.set(actionsRef.current, { y: 28, autoAlpha: 0 });

            const tl = gsap.timeline({
                delay: NAV_LEAD,
                defaults: { ease: "power2.out" },
            });

            // ASCII field settles in behind the copy, so the glyph grid
            // resolves rather than just appearing. The front crosses the canvas
            // at an even rate, so the ease only has to soften the ends of the
            // move — anything stronger makes the sweep visibly surge.
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
                    { y: 0, autoAlpha: 1, duration: 0.7 },
                    AT_ACTIONS
                );

            return () => {
                heading.revert();
                copy.revert();
            };
        },
        { dependencies: [loaderComplete], scope: rootRef }
    );

    // The hero is held in place by a sticky wrapper while the next layer
    // (Techstack) slides up over it, so the recede is scrubbed straight off
    // scroll position and lands just as that layer finishes covering it.
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

            // Blurring the full-screen ASCII canvas is the costly part, so
            // phones get a lighter radius for the same read.
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
                    <CubeBackgroundAscii debug intro={introRef} />
                </div>
                <div className="pointer-events-none max-md:w-full absolute inset-0 z-10 flex items-end pb-[12vw] p-[3vw] max-md:items-end max-md:p-6 max-sm:p-5">
                    {/* <div className="w-full bg-gradient-to-r pointer-events-none from-black/50 to-transparent h-full absolute inset-0" /> */}
                    <div className="space-y-[2.5vw] relative z-10 w-full max-md:space-y-8 max-sm:space-y-11">
                        <div className="flex flex-col h-fit font-neue-haas w-full items-start max-sm:gap-2 max-md:gap-5">
                            <h1 ref={headingRef} className="relative max-md:text-[13vw]! t96 mt-[1vw] w-[60vw] max-md:mt-0 max-md:w-[85%] max-sm:w-full">
                                The Interaction Layer your Website is <span className="gradient-text-animate">Missing.</span>
                            </h1>
                        </div>

                        <p ref={copyRef} className="t22 text-secondary w-[40vw] max-md:w-[80%] max-sm:w-full max-md:text-left max-sm:text-left">
                            100+ copy-paste effects for React & Next.js. Scroll, cursor, text, and WebGL interactions, preview and install with the CLI.
                        </p>

                        <div
                            ref={actionsRef}
                            className="pointer-events-auto flex max-sm:pt-4 max-sm:flex-col w-fit max-sm:w-full gap-[1vw] max-md:pb-[5vw] max-md:w-full max-md:gap-5"
                        >
                            <ButtonV3
                                text="Browse Effects"
                                href="/effects/free"
                                variant="outline"
                                className="max-sm:w-full max-sm:justify-center"
                            />
                            <ButtonV3
                                text="Upgrade to Pro"
                                href="/sign-up"
                                variant="orange"
                                scrollOffset={-1000}
                                className="max-sm:w-full max-sm:justify-center"
                            />
                        </div>
                    </div>
                </div>
            </div>
            {/* Darkens the hero as the next layer takes over, so the two
                sections never compete for attention mid-scroll. */}
            <div
                ref={overlayRef}
                className="pointer-events-none absolute inset-0 z-20 bg-background opacity-0"
            />
        </main>
    );
}
