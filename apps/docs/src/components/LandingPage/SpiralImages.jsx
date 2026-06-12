"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SpiralInformation from "./SpiralInformation";

gsap.registerPlugin(ScrollTrigger);

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

const RADIUS_X = 600;
const RADIUS_Y = 400;

// Config: how much the orbit radius expands in Phase 3 (e.g. 0.70 = 70% expansion)
const EXPAND_RADIUS_FACTOR = 0.72;

// NO ease: linear mapping from 0 to 1
function linear(t) {
    return Math.min(Math.max(t, 0), 1);
}

// Deterministic pseudo-random
function seededRand(seed, min, max) {
    const x = Math.sin(seed * 9301 + 49297) * 233280;
    return min + (x - Math.floor(x)) * (max - min);
}

const CARD_CONFIGS = IMAGES.map((src) => ({ src }));

const BLUR_CARDS = new Set(
    Array.from({ length: TOTAL }, (_, i) => i)
        .sort((a, b) => seededRand(a + 500, 0, 1) - seededRand(b + 500, 0, 1))
        .slice(0, 3),
);

export default function SpiralImages() {
    const sectionRef = useRef(null);
    const cardRefs = useRef([]);

    useEffect(() => {
        const section = sectionRef.current;
        const cards = cardRefs.current;

        gsap.ticker.lagSmoothing(500, 33);

        gsap.set(cards, {
            x: 0,
            y: 0,
            xPercent: -50,
            yPercent: -50,
            rotation: 0,
            scale: 1,
            zIndex: (i) => i,
        });

        const finalAngles = cards.map(
            (_, i) => -(i / TOTAL) * 2 * Math.PI - Math.PI / 6,
        );

        const finalWidths = cards.map((_, i) => seededRand(i + 900, 10, 30));

        const peakBlurs = cards.map((_, i) => seededRand(i + 100, 4, 10));

        const xSet = cards.map((c) => gsap.quickSetter(c, "x", "px"));

        const ySet = cards.map((c) => gsap.quickSetter(c, "y", "px"));

        const blurSet = cards.map((c) => (v) => (c.style.filter = `blur(${v}px)`));

        const widthSet = cards.map((c, i) => (p) => {
            c.style.width = `${18 + (finalWidths[i] - 18) * p}vw`;
        });

        const scaleSet = cards.map((c) => gsap.quickSetter(c, "scale"));

        const previousZ = Array(TOTAL).fill(-1);

        const ctx = gsap.context(() => {
            ScrollTrigger.create({
                trigger: section,
                start: "top center",
                end: "80% center",
                markers: false,
                scrub: true,

                onUpdate: (self) => {
                    const progress = self.progress;

                    const p1 = Math.min(progress / 0.1, 1);
                    const phase2Progress = Math.min(Math.max((progress - 0.1) / 0.5, 0), 1);
                    const phase3Progress = Math.min(
                        Math.max((progress - 0.5) / 0.5, 0),
                        1
                    );

                    cards.forEach((card, i) => {
                        const nextZ = p1 >= i / TOTAL ? TOTAL + i : i;

                        const staggerFrac = 0.82;
                        const reverseIdx = TOTAL - 1 - i;

                        const startFrac = (reverseIdx / TOTAL) * staggerFrac;

                        // Use linear mapping instead of ease function
                        const cardP2 = linear(
                            (phase2Progress - startFrac) / (1 - startFrac),
                        );

                        if (cardP2 > 0) {
                            let currentAngle = cardP2 * finalAngles[i];
                            const radiusP = cardP2;
                            // Apply orbital rotation & radius expansion in Phase 3
                            let radiusExpandX = 1.0;
                            let radiusExpandY = 1.0;

                            if (phase3Progress > 0) {
                                const orbitProgress = Math.pow(phase3Progress, 1.8);
                                const maxOrbitRotation = Math.PI * 2 * 0.55; // slower rotation (0.55 of a full circle)
                                currentAngle -= orbitProgress * maxOrbitRotation;

                                // Expand the orbit significantly outward (pushing images to the outside edges)
                                const expandProgress = Math.pow(phase3Progress, 1.4);
                                radiusExpandX += expandProgress * EXPAND_RADIUS_FACTOR;
                                radiusExpandY += expandProgress * EXPAND_RADIUS_FACTOR;
                            }

                            xSet[i](Math.cos(currentAngle) * radiusP * radiusExpandX * RADIUS_X);
                            ySet[i](Math.sin(currentAngle) * radiusP * radiusExpandY * RADIUS_Y);

                            // 3D Depth Scale: cards at the bottom scale up, cards at the top scale down
                            const yVal = Math.sin(currentAngle); // range [-1, 1]
                            const baseScale = 1.0;
                            const targetScale = 1.0 + yVal * 0.25;
                            const currentScale = baseScale + (targetScale - baseScale) * phase3Progress;
                            scaleSet[i](currentScale);

                            // Blur mapping
                            let finalBlur = 0;
                            if (BLUR_CARDS.has(i)) {
                                // Keep the card blurred at its peak once it has spiraled out
                                finalBlur = peakBlurs[i] * Math.sin(cardP2 * Math.PI / 2);
                            } else if (phase3Progress > 0) {
                                // Depth blur for other cards: up to 4.5px blur at the very top, sharp at the bottom
                                const depthBlur = Math.max(0, -yVal * 4.5);
                                finalBlur = depthBlur * phase3Progress;
                            }
                            blurSet[i](finalBlur);

                            // Depth-based z-sorting in Phase 3
                            if (phase3Progress > 0) {
                                const depthZ = TOTAL + Math.round((yVal + 1) * TOTAL);
                                if (depthZ !== previousZ[i]) {
                                    card.style.zIndex = depthZ;
                                    previousZ[i] = depthZ;
                                }
                            } else {
                                if (nextZ !== previousZ[i]) {
                                    card.style.zIndex = nextZ;
                                    previousZ[i] = nextZ;
                                }
                            }
                        } else {
                            xSet[i](0);
                            ySet[i](0);
                            widthSet[i](0);
                            blurSet[i](0);
                            scaleSet[i](1);
                            if (nextZ !== previousZ[i]) {
                                card.style.zIndex = nextZ;
                                previousZ[i] = nextZ;
                            }
                        }
                    });
                },
            });
        }, section);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            id="spiral-images"
            className="relative w-full h-[500vh] bg-background"
        >
            <div className="sticky  mt-[10vw] top-0 flex items-center justify-center w-full h-screen">
                <div className="relative flex items-center justify-center w-full h-full">
                    {CARD_CONFIGS.map(({ src }, i) => (
                        <div
                            key={i}
                            ref={(el) => (cardRefs.current[i] = el)}
                            className="absolute overflow-hidden rounded-md"
                            style={{
                                left: "50%",
                                top: "50%",
                                width: "18vw",
                                aspectRatio: "16/9",
                                zIndex: i,
                                willChange: "transform, width, filter",
                                backfaceVisibility: "hidden",
                                transform: "translateZ(0)",
                            }}
                        >
                            <Image
                                src={src}
                                alt={`card-${i}`}
                                fill
                                className="object-cover"
                                sizes="18vw"
                                priority={i < 3}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <SpiralInformation />
        </section>
    );
}
