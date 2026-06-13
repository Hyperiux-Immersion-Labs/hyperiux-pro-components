"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Button from "../Reusable/Button";

gsap.registerPlugin(ScrollTrigger, SplitText);

const IMAGES = [
    "/img/1.png",
    "/img/2.png",
    "/img/3.png",
    "/img/4.png",
    "/img/5.png",
    "/img/6.png",
    "/img/7.png",
    "/img/8.png",
    "/img/1.png",
];

const TOTAL = IMAGES.length;
const EXPAND_RADIUS_FACTOR = 1.8;

function linear(t) {
    return Math.min(Math.max(t, 0), 1);
}

function seededRand(seed, min, max) {
    const x = Math.sin(seed * 9301 + 49297) * 233280;
    return min + (x - Math.floor(x)) * (max - min);
}

const CARD_CONFIGS = IMAGES.map((src) => ({ src }));

export default function StorytellingMobile() {
    const sectionRef = useRef(null);
    const stickyContainerRef = useRef(null);
    const cardsContainerRef = useRef(null);
    const cardRefs = useRef([]);
    const infoTextRef = useRef(null);
    const infoButtonWrapperRef = useRef(null);
    const infoTextRef2 = useRef(null);

    useEffect(() => {
        const section = sectionRef.current;
        const cards = cardRefs.current;
        if (!section) return;

        let splittedParagraph = null;
        let splittedText2 = null;

        const mm = gsap.matchMedia();

        mm.add("(max-width: 640px)", () => {
            gsap.ticker.lagSmoothing(500, 33);

            // --- 1. Initial State Setup ---
            gsap.set(cards, {
                x: 0,
                y: 0,
                xPercent: -50,
                yPercent: -50,
                rotation: 0,
                scale: 1,
                zIndex: (i) => i,
                opacity: 1,
            });

            gsap.set(infoButtonWrapperRef.current, {
                opacity: 0,
                yPercent: 100,
            });

            gsap.set(infoTextRef2.current, {
                opacity: 1,
                filter: "blur(0px)",
            });

            const finalAngles = cards.map(
                (_, i) => -(i / TOTAL) * 2 * Math.PI - Math.PI / 6,
            );

            const xSet = cards.map((c) => gsap.quickSetter(c, "x", "px"));
            const ySet = cards.map((c) => gsap.quickSetter(c, "y", "px"));
            const blurSet = cards.map((c) => (v) => (c.style.filter = `blur(${v}px)`));
            const scaleSet = cards.map((c) => gsap.quickSetter(c, "scale"));

            const previousZ = Array(TOTAL).fill(-1);

            // --- 2. SplitText Initialization ---
            splittedParagraph = SplitText.create(infoTextRef.current, {
                type: "lines",
                mask: "lines",
            });

            if (infoTextRef2.current) {
                splittedText2 = SplitText.create(infoTextRef2.current, {
                    type: 'chars',
                    charsClass: 'char',
                });
            }

            // Measure dynamic mobile bounds matching desktop aspect ratio (1.5:1)
            const rx = window.innerWidth * 0.65;
            const ry = rx / 1.5;

            // --- 3. Scroll Sequence Timeline ---
            const masterTL = gsap.timeline({
                scrollTrigger: {
                    trigger: section,
                    start: "top top",
                    end: "bottom bottom",
                    scrub: true,
                    markers: false,
                },
            });

            // 3a. Spiral Cards Path Animation (Duration: 0 to 8)
            const spiralProxy = { progress: 0 };
            masterTL.to(spiralProxy, {
                progress: 1,
                duration: 8,
                ease: "none",
                onUpdate: () => {
                    const prog = spiralProxy.progress;
                    const p1 = Math.min(prog / 0.1, 1);
                    const t = Math.min(Math.max((prog - 0.1) / 0.9, 0), 1); // Single phase from 0.1 to 1.0

                    // flyProgress goes from 0 to 1 as t goes from 0 to 0.5
                    const flyProgress = Math.min(t / 0.5, 1);

                    // orbitProgress goes from 0 to 1 as t goes from 0 to 1.0
                    const orbitProgress = Math.pow(t, 2);

                    // expandProgress goes from 0 to 1 as t goes from 0 to 1.0
                    const expandProgress = Math.pow(t, 2.2);

                    cards.forEach((card, i) => {
                        const nextZ = p1 >= i / TOTAL ? TOTAL + i : i;
                        const staggerFrac = 0.82;
                        const reverseIdx = TOTAL - 1 - i;
                        const startFrac = (reverseIdx / TOTAL) * staggerFrac;

                        // flyout progress staggered within flyProgress
                        const cardP2 = linear(
                            (flyProgress - startFrac) / (1 - startFrac),
                        );

                        if (cardP2 > 0) {
                            const easedCardP2 = 1 - Math.pow(1 - cardP2, 2);

                            // Angle incorporates continuous global rotation
                            const maxOrbitRotation = Math.PI * 2 * 0.55;
                            let currentAngle = easedCardP2 * finalAngles[i] - orbitProgress * maxOrbitRotation;

                            const radiusP = easedCardP2;
                            const radiusExpand = 1.0 + expandProgress * EXPAND_RADIUS_FACTOR;

                            xSet[i](Math.cos(currentAngle) * radiusP * radiusExpand * rx);
                            ySet[i](Math.sin(currentAngle) * radiusP * radiusExpand * ry);

                            const yVal = Math.sin(currentAngle);

                            // Determine size/blur level: small, medium, big based on index
                            let cardBaseScale = 1.0;
                            let cardBaseBlur = 0;
                            if (i % 3 === 0) {
                                // Small
                                cardBaseScale = 0.65;
                                cardBaseBlur = 0;
                            } else if (i % 3 === 1) {
                                // Medium
                                cardBaseScale = 1.0;
                                cardBaseBlur = 2.5;
                            } else {
                                // Big
                                cardBaseScale = 1.45;
                                cardBaseBlur = 6.0;
                            }

                            // Interpolate scale from 1.0 to base scale as card flies out
                            const finalBaseScale = 1.0 + (cardBaseScale - 1.0) * easedCardP2;
                            // Interpolate blur from 0 to base blur as card flies out
                            const finalBaseBlur = cardBaseBlur * easedCardP2;

                            // Apply dynamic depth scale scaling based on single-phase t
                            const scaleRange = yVal * 0.25 * finalBaseScale;
                            const currentScale = finalBaseScale + scaleRange * t;
                            scaleSet[i](currentScale);

                            // Apply dynamic depth blur based on single-phase t
                            const depthBlur = Math.max(0, -yVal * 4.5);
                            const currentBlur = finalBaseBlur + depthBlur * t;
                            blurSet[i](currentBlur);

                            // Calculate dynamic zIndex
                            let depthZ = nextZ;
                            const targetZ = TOTAL + Math.round((yVal + 1) * TOTAL);
                            depthZ = Math.round(nextZ + (targetZ - nextZ) * t);

                            if (depthZ !== previousZ[i]) {
                                card.style.zIndex = depthZ;
                                previousZ[i] = depthZ;
                            }
                        } else {
                            xSet[i](0);
                            ySet[i](0);
                            blurSet[i](0);
                            scaleSet[i](1);
                            if (nextZ !== previousZ[i]) {
                                card.style.zIndex = nextZ;
                                previousZ[i] = nextZ;
                            }
                        }
                    });
                }
            }, 0);

            // 3b. Spiral Information Reveal (Duration: 3.5 to 5.5)
            masterTL.fromTo(
                splittedParagraph.lines,
                { yPercent: 100 },
                { yPercent: 0, ease: "power2.out", stagger: 0.04, duration: 1.5 },
                4.5
            );
            masterTL.fromTo(
                infoButtonWrapperRef.current,
                { opacity: 0, yPercent: 100 },
                { opacity: 1, ease: "power2.out", yPercent: 0, duration: 1.2 },
                4.6
            );

            // 3c. Spiral Information Exit (Duration: 6.0 to 7.2)
            masterTL.to(
                splittedParagraph.lines,
                { yPercent: -130, opacity: 0, ease: "power2.in", stagger: 0.02, duration: 1.0 },
                6.0
            );
            masterTL.to(
                infoButtonWrapperRef.current,
                { opacity: 0, ease: "power2.in", duration: 0.8 },
                6.0
            );

            // 3d. Large H2 "Not another static component kit." Reveal (Duration: 7.2 to 8.8)
            if (splittedText2 && splittedText2.chars) {
                masterTL.fromTo(
                    splittedText2.chars,
                    { opacity: 0, filter: "blur(10px)" },
                    { opacity: 1, filter: "blur(0px)", stagger: 0.03, ease: "none", duration: 1.2 },
                    7.2
                );
            }

            // 3e. Large H2 Exit & Cards Fade Out (Duration: 9.0 to 10.8)
            if (splittedText2 && splittedText2.chars) {
                masterTL.to(
                    splittedText2.chars,
                    { opacity: 0, filter: "blur(15px)", stagger: 0.02, ease: "none", duration: 1.0 },
                    9.0
                );
            }
            masterTL.set(infoTextRef2.current, { display: "none" }, 10.8);
            masterTL.to(
                cardsContainerRef.current,
                { opacity: 0, duration: 1.2, ease: "power2.inOut" },
                9.0
            );
            masterTL.set(cardsContainerRef.current, { pointerEvents: "none" }, 10.2);

            return () => {
                if (splittedParagraph) splittedParagraph.revert();
                if (splittedText2) splittedText2.revert();
            };
        });

        ScrollTrigger.refresh();
        const timer = setTimeout(() => {
            ScrollTrigger.refresh();
        }, 300);

        return () => {
            clearTimeout(timer);
            mm.revert();
        };
    }, []);

    return (
        <section
            ref={sectionRef}
            id="storytelling-mobile"
            className="relative w-full h-[600vh] bg-background sm:hidden"
        >
            <div
                ref={stickyContainerRef}
                className="sticky top-0 flex items-center justify-center w-full h-screen overflow-hidden"
            >
                {/* 1. Spiral Images Layer */}
                <div
                    ref={cardsContainerRef}
                    className="absolute inset-0 flex items-center justify-center w-full h-full z-10 pointer-events-none"
                >
                    <div className="relative flex items-center justify-center w-full h-full">
                        {CARD_CONFIGS.map(({ src }, i) => (
                            <div
                                key={i}
                                ref={(el) => (cardRefs.current[i] = el)}
                                className="absolute overflow-hidden rounded-md"
                                style={{
                                    left: "50%",
                                    top: "50%",
                                    width: "22vw",
                                    aspectRatio: "16/9",
                                    zIndex: i,
                                    willChange: "transform, width, filter",
                                    backfaceVisibility: "hidden",
                                }}
                            >
                                <Image
                                    src={src}
                                    alt={`card-${i}`}
                                    fill
                                    className="object-cover"
                                    sizes="22vw"
                                    priority={i < 3}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. Spiral Information Layer */}
                <div className="absolute inset-0 flex items-center gap-[6vw] flex-col justify-center h-full z-20 pointer-events-none px-6">
                    <h2
                        ref={infoTextRef}
                        className="text22 w-[90vw] mt-[5vw] leading-[1.6]! text-center text-white pointer-events-auto"
                    >
                        Explore 100+ scroll effects, cursor systems, text animations, page
                        transitions, WebGL scenes, navigation patterns, and creative UI
                        components built for React, Next.js, Tailwind, GSAP, Motion, Three.js,
                        and WebGL.
                    </h2>
                    <h2
                        ref={infoTextRef2}
                        className="text140 absolute left-1/2 -translate-x-1/2 w-[90vw] font-bold text-white text-center leading-[1.2] pointer-events-auto"
                    >
                        Not another static component kit.
                    </h2>
                    <div
                        ref={infoButtonWrapperRef}
                        className="flex flex-col gap-4 w-[80vw] pointer-events-auto mt-4"
                    >
                        <Button text="Install CLI"  />
                        <Button text="Work with Hyperiux" variant="white"  />
                    </div>
                </div>
            </div>
        </section>
    );
}
