"use client";

import { useRef } from "react";
import gsap from "gsap";
import SplitText from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

import CubeBackgroundAscii from "../components/CubeBackgroundAscii";
import ButtonV3 from "../components/ButtonV3";
import { useLoaderV3Complete } from "../components/loader-v3-state";
import { prefersReducedMotion } from "@/lib/motion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(SplitText);
}

export default function Hero() {
    const rootRef = useRef(null);
    const canvasRef = useRef(null);
    const headingRef = useRef(null);
    const copyRef = useRef(null);
    const actionsRef = useRef(null);

    const loaderComplete = useLoaderV3Complete();

    // Hidden from the first client frame — the loader panel is already covering
    // the page at this point, so nothing flashes before the intro plays.
    useGSAP(
        () => {
            if (prefersReducedMotion()) return;

            gsap.set(
                [
                    canvasRef.current,
                    headingRef.current,
                    copyRef.current,
                    actionsRef.current,
                ],
                { autoAlpha: 0 }
            );
        },
        { scope: rootRef }
    );

    useGSAP(
        () => {
            if (!loaderComplete || prefersReducedMotion()) return;

            const heading = SplitText.create(headingRef.current, {
                type: "lines",
                mask: "lines",
            });
            const copy = SplitText.create(copyRef.current, { type: "lines" });

            const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

            tl.set([headingRef.current, copyRef.current], { autoAlpha: 1 })
                // ASCII field settles in from a slight push-in, so the glyph
                // grid resolves rather than just appearing.
                .fromTo(
                    canvasRef.current,
                    { autoAlpha: 0 },
                    {
                        autoAlpha: 1,
                        duration: 1.8,
                        delay:1,
                        ease: "power2.out",
                    },
                    0
                )
                .fromTo(
                    heading.lines,
                    { yPercent: 110 },
                    { yPercent: 0, delay:.5, duration: 1.1, stagger: 0.09 },
                    0.15
                )
                .fromTo(
                    copy.lines,
                    { yPercent: 40, autoAlpha: 0 },
                    { yPercent: 0,delay:.5, autoAlpha: 1, duration: 0.8, stagger: 0.07 },
                    0.5
                )
                .to(
                    actionsRef.current,
                    { autoAlpha: 1,delay:.5, duration: 0.7, ease: "power2.out" },
                    0.75
                );

            return () => {
                heading.revert();
                copy.revert();
            };
        },
        { dependencies: [loaderComplete], scope: rootRef }
    );

    return (
        <main
            ref={rootRef}
            className="relative h-dvh w-screen overflow-hidden bg-background"
        >
            <div ref={canvasRef} className="absolute inset-0 will-change-transform">
                <CubeBackgroundAscii debug />
            </div>
            <div className="pointer-events-none absolute inset-0 z-10 flex items-end pb-[12vw] p-[3vw] max-md:items-end max-md:p-6 max-sm:p-5">
                {/* <div className="w-full bg-gradient-to-r pointer-events-none from-black/50 to-transparent h-full absolute inset-0" /> */}
                <div className="space-y-[2.5vw] relative z-10 max-md:space-y-[10vw] max-sm:space-y-[12vw]">
                    <div className="flex flex-col h-fit font-neue-haas w-full items-start max-sm:gap-2 max-md:gap-5">
                        <h1 ref={headingRef} className="relative t96 mt-[1vw] w-[60vw]">
                            The Interaction Layer your Website is <span className="gradient-text-animate">Missing</span>
                        </h1>
                    </div>

                    <p ref={copyRef} className="t22 text-secondary w-[40vw] max-md:w-[80%] max-sm:w-full max-md:text-left max-sm:text-left">
                        100+ copy-paste effects for React & Next.js. Scroll, cursor, text, and WebGL interactions, preview and install with the CLI.
                    </p>

                    <div
                        ref={actionsRef}
                        className="pointer-events-auto flex max-sm:pt-4 max-sm:flex-col w-fit max-sm:w-[88%] gap-[1vw] max-md:gap-5"
                    >
                        <ButtonV3
                            text="Browse Effects"
                            href="/effects/free"
                            variant="outline"
                        />
                        <ButtonV3
                            text="Upgrade to Pro"
                            href="/sign-up"
                            variant="orange"
                            scrollOffset={-1000}
                        />
                    </div>
                </div>
            </div>
        </main>
    );
}
