"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import VaultBox from "../WebsiteComps/VaultBoxes";
import RandomBlur from "../WebsiteComps/RandomBlur";
import SplitLine from "../WebsiteComps/SplitLine";

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger, SplitText);
}

const IMAGES = [
    "/img/spiral/1.png",
    "/img/spiral/2.png",
    "/img/spiral/3.png",
    "/img/spiral/4.png",
    "/img/spiral/5.png",
    "/img/spiral/6.png",
    "/img/spiral/7.png",
    "/img/spiral/8.png",
    "/img/spiral/9.png",
];

const TOTAL = IMAGES.length;

const RADIUS_X = 600;
const RADIUS_Y = 400;

// Config: how much the orbit radius expands in Phase 3 (e.g. 0.70 = 70% expansion)
const EXPAND_RADIUS_FACTOR = 0.67;

// Fraction of spiral phase (t) before card blur begins — keeps early fly-out sharp
const SPIRAL_BLUR_DELAY = 0.35;

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

const CARD_META = IMAGES.map((_, i) => {
    const category = Math.floor(seededRand(i + 2157, 0, 3));
    let scale = 1;
    let blur = 0;

    if (category === 0) {
        // Small (0.3 size)
        scale = seededRand(i + 45, 0.3, 0.35);
        blur = 0;
    } else if (category === 1) {
        // Middle (0.5 size)
        scale = seededRand(i + 45, 0.45, 0.55);
        blur = 2.5;
    } else {
        // Big (randomized size range, slightly lesser bigger)
        scale = seededRand(i + 45, 1.1, 1.35);
        blur = 8.0;
    }

    return { scale, blur };
});


const BOXES = [
    {
        id: "block-top-layer-1",
        styles: "w-[37.5%]",
        img: 'https://h1r7ltksnzlh2a5c.public.blob.vercel-storage.com/videos/1.mp4',
        number: "01",
        label: "Scroll Effects",
        title: "Scroll Stack",
        paragraph: "For layered storytelling sections that need depth and progression.",
        containerLink: "/demo/scroll-stack",
        labelLink:"/effects/scroll-effects"
    },
    {
        id: "block-top-layer-2",
        styles: "w-[25%]",
        img: 'https://h1r7ltksnzlh2a5c.public.blob.vercel-storage.com/videos/2.mp4',
        number: "02",
        label: "Text Animations",
        title: "Blur Text",
        paragraph: "For hero headlines, launch copy, and key messages that should reveal with control.",
        containerLink: "/demo/blur-text",
        labelLink:"/effects/text-animations"
    },
    {
        id: "block-top-layer-3",
        styles: "w-[37.5%]",
        img: 'https://h1r7ltksnzlh2a5c.public.blob.vercel-storage.com/videos/3.mp4',
        number: "03",
        label: "WebGL",
        title: "WebGL Slider",
        paragraph: "For immersive product, portfolio, or campaign visuals.",
        textColor: "text-black",
        containerLink: "/demo/webgl-slider",
        labelLink: "/effects/webgl"
    }
];

const BOXES_BOTTOM = [
    {
        id: "block-bottom-layer-1",
        styles: "w-[20%]",
        img: 'https://h1r7ltksnzlh2a5c.public.blob.vercel-storage.com/videos/4.mp4',
        number: "04",
        label: "Page Transitions",
        title: "Page Flip Transition",
        paragraph: "For portfolios and editorial experiences where route changes should feel authored.",
        containerLink: "/demo/page-flip-transition",
        labelLink: "/effects/page-transitions"
    },
    {
        id: "block-bottom-layer-2",
        styles: "w-[50%]",
        img: 'https://h1r7ltksnzlh2a5c.public.blob.vercel-storage.com/videos/5.mp4',
        number: "05",
        label: "Cursor Effects",
        title: "Liquid Glass Cursor",
        paragraph: "For desktop experiences that need tactile interaction and premium feedback.",
        textColor: "text-black",
        containerLink: "/demo/liquid-glass-cursor",
        labelLink: "/effects/cursor-effects"
    },
    {
        id: "block-bottom-layer-3",
        styles: "w-[30%]",
        img: 'https://h1r7ltksnzlh2a5c.public.blob.vercel-storage.com/videos/6.mp4',
        number: "06",
        label: "Components",
        title: "Animated FAQ",
        paragraph: "Dogfood your own product in the objection-handling section.",
        containerLink: "/demo/animated-faq",
        labelLink:  "/effects/components"
    }
];

export default function FeaturedStoryTelling() {
    const sectionRef = useRef(null);
    const cardRefs = useRef([]);
    const cardsContainerRef = useRef(null);

    // Refs from SpiralInformation
    const infoTextRef = useRef(null);
    const infoButtonWrapperRef = useRef(null);

    // Refs from VaultGrid
    const vaultSecondLayoutRef = useRef(null);
    const stickyContainerRef = useRef(null);
    const animationActiveRef = useRef(false);

    useEffect(() => {
        const section = sectionRef.current;
        const cards = cardRefs.current;

        animationActiveRef.current = true;

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

        if (infoButtonWrapperRef.current) {
            gsap.set(infoButtonWrapperRef.current, {
                opacity: 0,
                yPercent: 30,
            });
        }

        const TOP_LAYER = [
            { id: "block-top-layer-1", xPercent: 300 },
            { id: "block-top-layer-2", xPercent: 450 },
            { id: "block-top-layer-3", xPercent: 600 },
        ];
        const BOTTOM_LAYER = [
            { id: "block-bottom-layer-1", xPercent: 550 },
            { id: "block-bottom-layer-2", xPercent: 450 },
            { id: "block-bottom-layer-3", xPercent: 600 },
        ];

        TOP_LAYER.forEach(layer =>
            gsap.set(`#${layer.id}`, {
                xPercent: layer.xPercent,
            })
        );
        BOTTOM_LAYER.forEach(layer =>
            gsap.set(`#${layer.id}`, {
                xPercent: layer.xPercent,
            })
        );

        const finalAngles = cards.map(
            (_, i) => -(i / TOTAL) * 2 * Math.PI - Math.PI / 6,
        );


        const xSet = cards.map((c) =>
            c ? gsap.quickSetter(c, "x", "px") : () => {},
        );
        const ySet = cards.map((c) =>
            c ? gsap.quickSetter(c, "y", "px") : () => {},
        );
        const blurSet = cards.map(
            (c) => (v) => {
                if (!c) return;
                c.style.filter = `blur(${v}px)`;
            },
        );
        const scaleSet = cards.map((c) => {
            if (!c) return () => {};
            const setX = gsap.quickSetter(c, "scaleX");
            const setY = gsap.quickSetter(c, "scaleY");
            return (val) => {
                setX(val);
                setY(val);
            };
        });

        const previousZ = Array(TOTAL).fill(-1);

        // --- 2. SplitText Initialization ---
        const splittedParagraph = SplitText.create(infoTextRef.current, {
            type: "lines",
            mask: "lines",
        });

        // --- 3. Master Scroll Sequence Timeline ---
        const ctx = gsap.context(() => {
            const masterTL = gsap.timeline({
                scrollTrigger: {
                    trigger: section,
                    start: "-5% top",
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
                    if (!animationActiveRef.current) return;

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
                        if (!card) return;

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

                            xSet[i](Math.cos(currentAngle) * radiusP * radiusExpand * RADIUS_X);
                            ySet[i](Math.sin(currentAngle) * radiusP * radiusExpand * RADIUS_Y);

                            const yVal = Math.sin(currentAngle);

                            // Retrieve precomputed size/blur levels
                            const { scale: cardBaseScale, blur: cardBaseBlur } = CARD_META[i];

                            // Interpolate scale from 1.0 to base scale as card flies out
                            const finalBaseScale = 1.0 + (cardBaseScale - 1.0) * easedCardP2;
                            // Interpolate blur from 0 to base blur as card flies out
                            const blurGate = linear(
                                (t - SPIRAL_BLUR_DELAY) / (1 - SPIRAL_BLUR_DELAY),
                            );
                            const finalBaseBlur = cardBaseBlur * easedCardP2 * blurGate;

                            // Apply dynamic depth scale scaling based on single-phase t
                            const scaleRange = yVal * 0.25 * finalBaseScale;
                            const currentScale = finalBaseScale + scaleRange * t;
                            scaleSet[i](currentScale);

                            // Apply dynamic depth blur based on single-phase t
                            const depthBlur = Math.max(0, -yVal * 4.5);
                            const currentBlur = finalBaseBlur + depthBlur * t * blurGate;
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
                3.85
            );
            if (infoButtonWrapperRef.current) {
                masterTL.fromTo(
                    infoButtonWrapperRef.current,
                    { opacity: 0, yPercent: 30 },
                    { opacity: 1, ease: "power2.out", yPercent: 0, duration: 1.2 },
                    3.95
                );
            }

            // 3c. Spiral Information Exit (Duration: 6.0 to 7.2)
            masterTL.to(
                splittedParagraph.lines,
                { yPercent: -130, opacity: 0, ease: "power2.in", stagger: 0.02, duration: 1.0 },
                6.0
            );
            if (infoButtonWrapperRef.current) {
                masterTL.to(
                    infoButtonWrapperRef.current,
                    { opacity: 0, ease: "power2.in", duration: 0.8 },
                    6.0
                );
            }

            // Cards Fade Out
            masterTL.to(
                cardsContainerRef.current,
                { opacity: 0, duration: 1.2, ease: "power2.inOut" },
                7.0
            );
            masterTL.set(cardsContainerRef.current, { pointerEvents: "none" }, 8.2);

            // 3d. Vault Grid Boxes Slide in
            TOP_LAYER.forEach((layer, i) => {
                masterTL.to(
                    `#${layer.id}`,
                    { xPercent: 0, duration: 1.5, ease: "power2.out" },
                    7.5 + i * 0.15
                );
            });
            BOTTOM_LAYER.forEach((layer, i) => {
                masterTL.to(
                    `#${layer.id}`,
                    { xPercent: 0, duration: 1.5, ease: "power2.out" },
                    8 + i * 0.15
                );
            });
        }, section);

        // This section mounts LATE (gated behind isMounted in the parent) and is
        // 800vh tall. Every ScrollTrigger built by the components below it
        // (Workflow, UIKit, SmallMotion, …) computed its start/end BEFORE this
        // section existed in the layout, so once it mounts their positions are
        // stale and those animations stop firing. A global refresh recomputes
        // every trigger on the page, re-syncing everything downstream.
        const refresh = () => ScrollTrigger.refresh();
        const rafId = requestAnimationFrame(refresh);
        window.addEventListener("load", refresh);

        const imgs = section ? Array.from(section.querySelectorAll("img")) : [];
        imgs.forEach((img) => {
            if (!img.complete) img.addEventListener("load", refresh, { once: true });
        });

        return () => {
            animationActiveRef.current = false;
            cancelAnimationFrame(rafId);
            window.removeEventListener("load", refresh);
            imgs.forEach((img) => img.removeEventListener("load", refresh));
            ctx.revert();
            splittedParagraph.revert();
        };
    }, []);

    return (
        <section
            ref={sectionRef}
            id="spiral-images"
            className="relative w-full h-[600vh] max-md:hidden  z-50"
            
        >
            <RandomBlur as="h2" className="text110 w-[80vw] mx-auto text-center">
                Explore the Moments your Website is  <span className='text-[#ff5f00]'>Missing.</span>
            </RandomBlur>
            <SplitLine as="p" className="mx-auto mt-[2vw] max-w-[65vw] text-center text24 font-light leading-[1.55] text-white max-md:mt-5 max-md:max-w-[82vw] max-md:text-sm max-sm:max-w-full">
                Hover it. Scroll it. Break it. Then copy it
            </SplitLine>
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
                                    width: "18vw",
                                    height:"11vw",
                                    zIndex: i,
                                    willChange: "transform, width, filter",
                                    backfaceVisibility: "hidden",
                                }}
                            >
                                <Image
                                    src={src}
                                    alt={`spiral-card-images`}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 1024px) 0vw, 18vw"
                                    loading="lazy"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. Spiral Information Layer */}
                <div className="absolute inset-0 flex items-center gap-[3.5vw] flex-col self-padd justify-center h-full z-10 pointer-events-none">
                    <h2
                        ref={infoTextRef}
                        className="text34 w-[45vw] mt-[5vw] leading-[1.6]! text-center pointer-events-auto"
                    >
                        Vault is easiest to understand when you feel it. Preview a few high-impact effects below, then open the full catalog when you are ready.
                    </h2>
                   
                </div>

                {/* 3. Vault Grid Second Layout Layer */}
                <div
                    ref={vaultSecondLayoutRef}
                    className="absolute inset-0 top-[3%] flex h-screen flex-col items-center justify-center self-padd z-20 pointer-events-none"
                >
                    {/* Top Layer */}
                    <div className="w-full relative z-10 h-[40vh] gap-[1.5vw] flex items-center justify-center pointer-events-auto">
                        {BOXES.map(box => (
                            <VaultBox key={box.id} {...box} />
                        ))}
                    </div>

                    {/* Bottom Layer */}
                    <div className="w-full h-[40vh] relative z-10 gap-[1.5vw] flex items-center justify-center pointer-events-auto mt-[1.5vw]">
                        {BOXES_BOTTOM.map(box => (
                            <VaultBox key={box.id} {...box} />
                        ))}
                  
                    </div>
                </div>
            </div>
        </section>
    );
}
