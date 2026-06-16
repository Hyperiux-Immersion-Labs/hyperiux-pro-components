"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Button from "../Reusable/Button";
import VaultBox from "../Reusable/VaultBoxes";

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger, SplitText);
}

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
        img: '/video/1.mp4',
        number: "01",
        label: "Scroll Effects"
    },
    {
        id: "block-top-layer-2",
        styles: "w-[25%]",
        img: '/video/2.mp4',
        number: "02",
        label: "Cusor Effects"
    },
    {
        id: "block-top-layer-3",
        styles: "w-[37.5%]",
        img: '/video/3.mp4',
        number: "03",
        label: "WebGL"
    }
];

const BOXES_BOTTOM = [
    {
        id: "block-bottom-layer-1",
        styles: "w-[20%]",
        img: '/video/4.mp4',
        number: "04",
        label: "Text Animations"
    },
    {
        id: "block-bottom-layer-2",
        styles: "w-[50%]",
        img: '/video/1.mp4',
        number: "05",
        label: "Page Transitions"
    },
    {
        id: "block-bottom-layer-3",
        styles: "w-[30%]",
        img: '/video/6.mp4',
        number: "06",
        label: "Navigations"
    }
];

export default function FeaturedStoryTelling() {
    const sectionRef = useRef(null);
    const cardRefs = useRef([]);
    const cardsContainerRef = useRef(null);

    // Refs from SpiralInformation
    const infoTextRef = useRef(null);
    const infoButtonWrapperRef = useRef(null);
    const infoTextRef2 = useRef(null);

    // Refs from VaultGrid
    const vaultTextRef = useRef(null);
    const vaultMoveTextRef = useRef(null);
    const vaultSecondLayoutRef = useRef(null);
    const vaultNavigatedTextRef = useRef(null);
    const vaultReadTextRef = useRef(null);
    const vaultAndTextRef = useRef(null);
    const vaultExploreTextRef = useRef(null);
    const stickyContainerRef = useRef(null);
    const vaultTargetMoveRef = useRef(null);

    useEffect(() => {
        const section = sectionRef.current;
        const cards = cardRefs.current;

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

        gsap.set(vaultTextRef.current, { opacity: 0, filter: "blur(10px)" });
        gsap.set(vaultMoveTextRef.current, { opacity: 0, filter: "blur(10px)" });
        gsap.set(
            [
                vaultNavigatedTextRef.current,
                vaultReadTextRef.current,
                vaultAndTextRef.current,
                vaultExploreTextRef.current
            ],
            {
                xPercent: 20,
                opacity: 0,
                filter: "blur(10px)",
            }
        );

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


        const xSet = cards.map((c) => gsap.quickSetter(c, "x", "px"));
        const ySet = cards.map((c) => gsap.quickSetter(c, "y", "px"));
        const blurSet = cards.map((c) => (v) => (c.style.filter = `blur(${v}px)`));
        const scaleSet = cards.map((c) => {
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

        let splittedText2 = null;
        if (infoTextRef2.current) {
            splittedText2 = SplitText.create(infoTextRef2.current, {
                type: 'chars',
                charsClass: 'char',
            });
        }

        const vaultSplit = SplitText.create(vaultTextRef.current, {
            type: 'words,chars',
        });

        const vaultMoveSplit = SplitText.create(vaultMoveTextRef.current, {
            type: 'words,chars',
        });

        gsap.set(vaultSplit.chars, { color: "#232323ff" });
        gsap.set(vaultMoveSplit.chars, { color: "#232323ff" });

        const words = vaultSplit.words;
        const lastWordElement = words[words.length - 1];

        const updatePositions = () => {
            if (!stickyContainerRef.current || !lastWordElement || !vaultMoveTextRef.current) return;
            const stickyRect = stickyContainerRef.current.getBoundingClientRect();
            const sourceRect = lastWordElement.getBoundingClientRect();
            const sourceX = sourceRect.left - stickyRect.left;
            const sourceY = sourceRect.top - stickyRect.top;

            gsap.set(vaultMoveTextRef.current, { x: sourceX, y: sourceY });
        };

        // Run once initially
        updatePositions();

        let cachedMoveX = 0;
        let cachedMoveY = 0;

        const cacheMoveTarget = () => {
            if (!stickyContainerRef.current || !vaultTargetMoveRef.current) return;
            const stickyRect = stickyContainerRef.current.getBoundingClientRect();
            const targetRect = vaultTargetMoveRef.current.getBoundingClientRect();
            cachedMoveX = targetRect.left - stickyRect.left;
            cachedMoveY = targetRect.top - stickyRect.top;
        };

        cacheMoveTarget();

        // Register ScrollTrigger refreshInit listener
        ScrollTrigger.addEventListener("refreshInit", updatePositions);
        ScrollTrigger.addEventListener("refreshInit", cacheMoveTarget);

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

                            xSet[i](Math.cos(currentAngle) * radiusP * radiusExpand * RADIUS_X);
                            ySet[i](Math.sin(currentAngle) * radiusP * radiusExpand * RADIUS_Y);

                            const yVal = Math.sin(currentAngle);

                            // Retrieve precomputed size/blur levels
                            const { scale: cardBaseScale, blur: cardBaseBlur } = CARD_META[i];

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
                3.85
            );
            masterTL.fromTo(
                infoButtonWrapperRef.current,
                { opacity: 0, yPercent: 100 },
                { opacity: 1, ease: "power2.out", yPercent: 0, duration: 1.2 },
                3.95
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

            // 3f. Vault Grid First Text Reveal (Duration: 11.0 to 13.5)
            masterTL.to(
                [vaultTextRef.current, vaultMoveTextRef.current],
                { opacity: 1, filter: "blur(0px)", duration: 1.0, ease: "power2.out" },
                9.8
            );
            masterTL.to(
                vaultSplit.chars,
                {
                    keyframes: [
                        { color: "#ff5f00", duration: 0.02 },
                        { color: "#ffffff", duration: 0.15 }
                    ],
                    stagger: 0.01
                },
                11.0
            );
            masterTL.to(
                vaultMoveSplit.chars,
                {
                    keyframes: [
                        { color: "#ff5f00", duration: 0.02, ease: "power1.out" },
                        { color: "#ffffff", duration: 0.15, ease: "power1.inOut" }
                    ],
                    stagger: { amount: 0.01 },
                    ease: "none"
                },
                12
            );

            // 3g. Vault Grid First Text Exit & "move" Text Transition (Duration: 13.8 to 15.0)
            masterTL.to(
                [vaultSplit.words, '.dots'],
                { opacity: 0, filter: "blur(10px)", stagger: { amount: 0.2, from: "random" }, ease: "power2.out", duration: 1.0 },
                13.8
            );

            masterTL.to(
                vaultMoveTextRef.current,
                {
                    x: () => cachedMoveX,
                    duration: 0.6,
                    // ease: "power2.inOut"
                },
                13.8
            );

            masterTL.to(
                vaultMoveTextRef.current,
                {
                    y: () => cachedMoveY,
                    duration: 0.6,
                    // ease: "power2.inOut"
                },
                14.4
            );

            // 3h. Vault Grid Boxes Slide in & Second Text Reveal (Duration: 14.8 to 18.0)
            TOP_LAYER.forEach((layer, i) => {
                masterTL.to(
                    `#${layer.id}`,
                    { xPercent: 0, duration: 1.5, ease: "power2.out" },
                    14.8 + i * 0.15
                );
            });
            BOTTOM_LAYER.forEach((layer, i) => {
                masterTL.to(
                    `#${layer.id}`,
                    { xPercent: 0, duration: 1.5, ease: "power2.out" },
                    15.3 + i * 0.15
                );
            });
            masterTL.to(
                [
                    vaultNavigatedTextRef.current,
                    vaultReadTextRef.current,
                    vaultAndTextRef.current,
                    vaultExploreTextRef.current
                ],
                { xPercent: 0, opacity: 1, filter: "blur(0px)", stagger: 0.15, ease: "power2.out", duration: 1.2 },
                15.1
            );

            // 3i. Vault Grid Collapse & Fade Out (Duration: 18.5 to 20.0)
            masterTL.to(
                [
                    vaultNavigatedTextRef.current,
                    vaultReadTextRef.current,
                    vaultAndTextRef.current,
                    vaultExploreTextRef.current,
                    vaultMoveTextRef.current,
                ],
                { opacity: 0, filter: 'blur(10px)', duration: 1.2, ease: "power2.out" },
                17.5
            );
            masterTL.to(
                "#heading-container",
                { height: "1.5vw", duration: 1.2, transformOrigin: "center center", ease: "power2.inOut" },
                17.5
            );
        }, section);

        return () => {
            ScrollTrigger.removeEventListener("refreshInit", updatePositions);
            ScrollTrigger.removeEventListener("refreshInit", cacheMoveTarget);
            ctx.revert();
            splittedParagraph.revert();
            if (splittedText2) splittedText2.revert();
            vaultSplit.revert();
            vaultMoveSplit.revert();
        };
    }, []);

    return (
        <section
            ref={sectionRef}
            id="spiral-images"
            className="relative w-full h-[1100vh] bg-background max-sm:hidden"
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
                                    width: "18vw",
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
                                    sizes="18vw"
                                    priority={i < 3}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. Spiral Information Layer */}
                <div className="absolute inset-0 flex items-center gap-[3.5vw] flex-col self-padd justify-center h-full z-999 pointer-events-none">
                    <h2
                        ref={infoTextRef}
                        className="text34 w-[45vw] mt-[5vw] leading-[1.6]! text-center pointer-events-auto"
                    >
                        Explore 100+ scroll effects, cursor systems, text animations, page
                        transitions, WebGL scenes, navigation patterns, and creative UI
                        components built for React, Next.js, Tailwind, GSAP, Motion, Three.js,
                        and WebGL.
                    </h2>
                    <h2
                        ref={infoTextRef2}
                        className="text140 absolute left-1/2 -translate-x-1/2 w-[60vw] text-center pointer-events-auto"
                    >
                        Not another static <br /> component kit.
                    </h2>
                    <div
                        ref={infoButtonWrapperRef}
                        className="flex items-center justify-center gap-[2vw] pointer-events-auto"
                    >
                        <Button text="Install CLI" />
                        <Button text="Work with Hyperiux" className="border border-white" variant="white" />
                    </div>
                </div>

                {/* 3. Vault Grid First Text Overlay */}
                <h2
                    ref={vaultTextRef}
                    className="absolute text80 w-[85vw] text-center opacity-0 text-[#939393] z-30 pointer-events-none"
                >
                    Hyperiux Vault is built around the interaction layer of a
                    website, the moments people notice when they scroll, hover, <span className="opacity-0">move</span>
                </h2>
                <p
                    ref={vaultMoveTextRef}
                    className="absolute left-0 top-0 m-0 p-0 text-[#939393] text80 z-30 pointer-events-none"
                >
                    move<span className="dots">...</span>
                </p>

                {/* 4. Vault Grid Second Layout Layer */}
                <div
                    ref={vaultSecondLayoutRef}
                    className="absolute inset-0 flex h-screen flex-col items-center justify-center self-padd z-20 pointer-events-none"
                >
                    {/* Top Layer */}
                    <div className="w-full relative z-10 h-[40vh] gap-[1.5vw] flex items-center justify-center pointer-events-auto">
                        {BOXES.map(box => (
                            <VaultBox key={box.id} {...box} />
                        ))}
                    </div>

                    {/* Middle Heading Container */}
                    <div id="heading-container" className="w-full relative z-0 h-[30vh] flex items-center justify-center pointer-events-auto">
                        <span ref={vaultTargetMoveRef} className="text80 opacity-0 text-center">
                            move
                        </span>
                        <span ref={vaultNavigatedTextRef} className="text80 text-center text-foreground">
                            &nbsp;, navigate,&nbsp;
                        </span>
                        <span ref={vaultReadTextRef} className="text80 text-center text-foreground">
                            read,&nbsp;
                        </span>
                        <span ref={vaultAndTextRef} className="text80 text-center text-foreground">
                            and&nbsp;
                        </span>
                        <span ref={vaultExploreTextRef} className="text80 text-center text-foreground">
                            explore
                        </span>
                    </div>

                    {/* Bottom Layer */}
                    <div className="w-full h-[40vh] relative z-10 gap-[1.5vw] flex items-center justify-center pointer-events-auto">
                        {BOXES_BOTTOM.map(box => (
                            <VaultBox key={box.id} {...box} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
