"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
// import Button from "../Reusable/Button";
import useIsMobile, { COMPACT_LAYOUT_BREAKPOINT, PHONE_BREAKPOINT } from "@/hooks/useIsMobile";
import Button from "../WebsiteComps/Button";

gsap.registerPlugin(ScrollTrigger, SplitText);

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

// For reproducible randomness
function pseudoRandom(seed, i, min, max) {
    const x = Math.sin(seed * 100 + i * 999) * 10000;
    return min + ((x - Math.floor(x)) * (max - min));
}

export default function StorytellingMobile() {
    const sectionRef = useRef(null);
    const infoTextRef = useRef(null);
    const infoButtonWrapperRef = useRef(null);
    const infoTextRef2 = useRef(null);
    const circleRef = useRef(null);

    // Use state to track rotation to avoid ref read in render
    const [circleRotation, setCircleRotation] = useState(0);

    // Phone (<768px) vs tablet (768–1024px) — not the compact layout breakpoint (1025px)
    const { isMounted, isMobile: isPhone } = useIsMobile(PHONE_BREAKPOINT);

    useEffect(() => {
        if (!isMounted) return;
        ScrollTrigger.refresh();
    }, [isMounted, isPhone]);

    useEffect(() => {
        if (!sectionRef.current) return;

        let splittedParagraph = null;
        let splittedText2 = null;
        let scrollTween = null;

        // Only mobile
        const mm = gsap.matchMedia();
        mm.add(`(max-width: ${COMPACT_LAYOUT_BREAKPOINT - 1}px)`, () => {
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

            const masterTL = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top top",
                    end: "bottom bottom",
                    scrub: true,
                    markers: false,
                },
            });

            masterTL.fromTo(
                splittedParagraph.lines,
                { yPercent: 100, opacity: 0 },
                { yPercent: 0, opacity: 1, ease: "power2.out", stagger: 0.04, duration: 1.5 },
                0.2
            );
            masterTL.fromTo(
                infoButtonWrapperRef.current,
                { opacity: 0, yPercent: 100 },
                { opacity: 1, ease: "power2.out", yPercent: 0, duration: 1.2 },
                0.35
            );
            masterTL.to(
                splittedParagraph.lines,
                { yPercent: -130, opacity: 0, ease: "power2.in", stagger: 0.02, duration: 1.0 },
                1.6
            );
            masterTL.to(
                infoButtonWrapperRef.current,
                { opacity: 0, ease: "power2.in", duration: 0.8 },
                1.75
            );
            if (splittedText2 && splittedText2.chars) {
                masterTL.fromTo(
                    splittedText2.chars,
                    { opacity: 0 },
                    { opacity: 1, stagger: 0.03, ease: "none", duration: 1.2 },
                    2.2
                );
                masterTL.to(
                    splittedText2.chars,
                    { opacity: 0, stagger: 0.02, ease: "none", duration: 1.0 },
                    3.6
                );
            }
            masterTL.set(infoTextRef2.current, { display: "none" }, 5);

            // --- Rotating circle on scroll ---
            if (circleRef.current) {
                let updateRotation = (angle) => setCircleRotation(angle);

                // Remove any direct transform as we control via React
                circleRef.current.style.transform = "";

                scrollTween = ScrollTrigger.create({
                    trigger: sectionRef.current,
                    start: "top 90%",
                    end: "bottom 10%",
                    scrub: true,
                    onUpdate: (self) => {
                        // angle in degrees, slow full turn for drama
                        // more dramatic and longer (e.g. 420 deg)
                        const angle = self.progress * 420;
                        updateRotation(angle);
                    },
                    markers: false
                });
            }

            return () => {
                if (splittedParagraph) splittedParagraph.revert();
                if (splittedText2) splittedText2.revert();
                if (scrollTween && scrollTween.kill) scrollTween.kill();
            };
        });

        return () => {
            mm.revert();
        };
    }, []);

    // Circle settings (make it a proper circle, not an oval)
    const imageCount = IMAGES.length;
    const centerVW = 50;
    const centerVH = 50;
    const SEED = 42;
    const imageDiameterVW = 19;

    // Phone: wider spread (70vw). Tablet: tighter circle (50vw).
    const radiusVW = isMounted && isPhone ? 70 : 50;

    // Images: compensate for the circle rotation to keep them upright!
    const circleImages = IMAGES.map((src, i) => {
        const baseAngle = (2 * Math.PI * i) / imageCount - Math.PI / 2;
        const angleRandom = pseudoRandom(SEED, i, -0.21, 0.21);
        const angle = baseAngle + angleRandom;
        const radiusMod = pseudoRandom(SEED, i + 99, 0.88, 1.12);
        const x = Math.cos(angle) * radiusVW * radiusMod;
        const y = Math.sin(angle) * radiusVW * radiusMod; // use radiusVW for y too (circle!)

        const imgExtraRot = pseudoRandom(SEED, i + 33, -8, 8);
        const imgScale = pseudoRandom(SEED, i + 66, 0.93, 1.13);

        // Subtract the current circle rotation so image stays upright
        return (
            <div
                key={src}
                style={{
                    position: "absolute",
                    left: `calc(${centerVW}vw + ${x}vw - ${(imageDiameterVW * 1.5) / 2}vw)`, // adjust for landscape width
                    top: `calc(${centerVH}vh + ${y}vw - ${imageDiameterVW / 2}vw)`, // keep vertical centered
                    width: `${imageDiameterVW * 1.5}vw`, // landscape ratio, e.g., 3:2 width:height
                    height: `${imageDiameterVW}vw`,
                    borderRadius: "5px",
                    overflow: "hidden",
                    boxShadow: "0 0 16px rgba(0,0,0,0.11)",
                    zIndex: 1,
                    transform: `rotate(${imgExtraRot - circleRotation}deg) scale(${imgScale})`,
                    pointerEvents: "none",
                    aspectRatio: "3 / 2",
                }}
            >
                <Image
                    src={src}
                    alt="circle-img"
                    fill
                    style={{
                        objectFit: "cover",
                        borderRadius: "5px",
                    }}
                    sizes={`${imageDiameterVW * 1.5}vw`}
                    priority={i < 3}
                />
            </div>
      
        );
    });

    return (
        <section
            ref={sectionRef}
            id="storytelling-mobile"
            className="relative w-full h-[350vh] z-500 mt-[10vw] mb-[20vw]"
        >
            <div
                className="sticky top-0 flex items-center justify-center w-full h-screen overflow-hidden"
            >
                {/* 1. Scattered Images Layer */}
                <div
                    style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
                    className="z-10"
                >
                    <div 
                        className="relative w-full h-full"
                        style={{
                            width: "100vw",
                            height: "100vh",
                            transformOrigin: "50% 50%",
                            willChange: "transform",
                            transform: `rotate(${circleRotation}deg)`,
                        }}
                        ref={circleRef}
                    >
                        {circleImages}
                    </div>
                </div>

                {/* 2. Info Layer, CENTERED by absolute full container flexbox */}
                <div className="absolute inset-0 flex flex-col justify-center items-center h-full z-20 pointer-events-none px-6">
                    <h2
                        ref={infoTextRef}
                        className="text22 w-[90vw] max-w-[500px] leading-[1.6]! text-center text-white pointer-events-auto"
                        style={{
                            margin: 0,
                        }}
                    >
                        Explore 100+ scroll effects, cursor systems, text animations, page
                        transitions, WebGL scenes, navigation patterns, and creative UI
                        components built for React, Next.js, Tailwind, GSAP, Motion, Three.js,
                        and WebGL.
                    </h2>
                    <h2
                        ref={infoTextRef2}
                        className="text140 mt-8 absolute  font-bold text-white text-center leading-[1.2] pointer-events-auto max-w-[700px] w-full"
                        style={{
                            margin: 0,
                        }}
                    >
                        Not another static <br /> component kit.
                    </h2>
                    <div
                        ref={infoButtonWrapperRef}
                        className="flex flex-col items-center gap-4 w-fit pointer-events-auto mt-8"
                    >
                        <div className="w-fit">
                            <Button text="Install CLI" href="/docs/installation"  />
                        </div>
                        <Button text="Work with Hyperiux" variant="white"  href="#" />
                    </div>
                </div>
            </div>
        </section>
    );
}
