"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
// import Button from "../Reusable/Button";
import Button from "../WebsiteComps/Button";
import RandomBlur from "../WebsiteComps/RandomBlur";
import SplitLine from "../WebsiteComps/SplitLine";

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
    const stmSectionRef = useRef(null);
    const stmInfoTextRef = useRef(null);
    const stmInfoButtonWrapperRef = useRef(null);
    const stmCircleRef = useRef(null);

    // Use state to track rotation to avoid ref read in render
    const [stmCircleRotation, setStmCircleRotation] = useState(0);

    useEffect(() => {
        const section = stmSectionRef.current;
        if (!section) return;

        let split = null;

        const ctx = gsap.context(() => {
            if (!stmInfoTextRef.current) return;

            split = SplitText.create(stmInfoTextRef.current, {
                type: "lines",
                mask: "lines",
            });

            // Scrub-tied reveal + exit — same behaviour as the desktop
            // FeaturedStoryTelling text: the masked lines slide UP into view,
            // hold, then slide up and out (yPercent -130) as you scroll. This is
            // a controlled exit driven by scroll, NOT the paragraph naturally
            // drifting off with the page.
            const masterTL = gsap.timeline({
                scrollTrigger: {
                    trigger: section,
                    start: "top top",
                    end: "bottom bottom",
                    scrub: true,
                    markers: false,
                },
            });

            // Reveal (in)
            masterTL.fromTo(
                split.lines,
                { yPercent: 100 },
                { yPercent: 0, ease: "power2.out", stagger: 0.04, duration: 1.5 },
                0.5
            );
            if (stmInfoButtonWrapperRef.current) {
                masterTL.fromTo(
                    stmInfoButtonWrapperRef.current,
                    { opacity: 0, yPercent: 30 },
                    { opacity: 1, ease: "power2.out", yPercent: 0, duration: 1.2 },
                    0.6
                );
            }

            // Exit (out) — masked slide up, like desktop
            masterTL.to(
                split.lines,
                { yPercent: -130, opacity: 0, ease: "power2.in", stagger: 0.02, duration: 1.0 },
                2.8
            );
            if (stmInfoButtonWrapperRef.current) {
                masterTL.to(
                    stmInfoButtonWrapperRef.current,
                    { opacity: 0, ease: "power2.in", duration: 0.8 },
                    2.8
                );
            }

            // The paragraph starts hidden in the DOM (visibility:hidden below) to
            // avoid a flash of the full text before GSAP runs. Now that each line
            // is masked/hidden by the reveal from-state above, reveal the
            // container so the animation plays from truly blank.
            gsap.set(stmInfoTextRef.current, { autoAlpha: 1 });

            // --- Rotating circle on scroll ---
            if (stmCircleRef.current) {
                // Remove any direct transform as we control via React state.
                stmCircleRef.current.style.transform = "";

                ScrollTrigger.create({
                    trigger: section,
                    start: "top 90%",
                    end: "bottom 10%",
                    scrub: true,
                    onUpdate: (self) => {
                        // more dramatic and longer full turn (420deg)
                        const angle = self.progress * 420;
                        setStmCircleRotation(angle);
                    },
                    markers: false,
                });
            }
        }, section);

        // Fonts and next/image can settle AFTER the triggers are built, which
        // otherwise leaves the split lines stuck at their hidden "from" state.
        // Recompute trigger positions once things have painted and as images load.
        const refresh = () => ScrollTrigger.refresh();
        const rafId = requestAnimationFrame(refresh);
        window.addEventListener("load", refresh);

        const imgs = Array.from(section.querySelectorAll("img"));
        imgs.forEach((img) => {
            if (!img.complete) img.addEventListener("load", refresh, { once: true });
        });

        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener("load", refresh);
            imgs.forEach((img) => img.removeEventListener("load", refresh));
            if (split) split.revert();
            ctx.revert();
        };
    }, []);

    // Circle settings (make it a proper circle, not an oval)
    const imageCount = IMAGES.length;
    const centerVW = 50;
    const centerVH = 50;
    const SEED = 42;
    const imageDiameterVW = 19;

    // Phone: wider spread (70vw). Tablet: tighter spread (50vw).
    const isTablet =
        typeof window !== "undefined" && window.innerWidth >= 768;
    const radiusVW = isTablet ? 55 : 70;

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
                    transform: `rotate(${imgExtraRot - stmCircleRotation}deg) scale(${imgScale})`,
                    pointerEvents: "none",
                    aspectRatio: "3 / 2",
                }}
            >
                <Image
                    src={src}
                    alt="spiral-images"
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
            ref={stmSectionRef}
            id="stm-storytelling-mobile"
            className="stm-storytelling-section relative hidden max-md:block w-full h-[250vh] z-500 mt-[10vw] mb-[20vw]"
        >
            <RandomBlur
                as="h2"
                className="text110  w-[95vw] max-sm:w-[98vw] mb-[10vw] mx-auto text-center"
            >
                Explore the Moments your Website is  <span className='text-[#ff5f00]'>Missing.</span>
            </RandomBlur>
            <SplitLine as="p" className="mx-auto mt-[2vw] max-w-[65vw] text-center text24 font-light leading-[1.55] text-white max-md:mt-4 max-md:max-w-[82vw] max-md:text-sm max-sm:max-w-full">
                            Hover it. Scroll it. Break it. Then copy it
                        </SplitLine>
           
            <div
                className="sticky top-0 max-sm:top-10 flex items-center justify-center w-full h-screen overflow-hidden"
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
                            transform: `rotate(${stmCircleRotation}deg)`,
                        }}
                        ref={stmCircleRef}
                    >
                        {circleImages}
                    </div>
                </div>

                {/* 2. Info Layer, CENTERED by absolute full container flexbox */}
                <div className="absolute inset-0 flex flex-col justify-center items-center h-full z-20 pointer-events-none px-6">
                    <h2
                        ref={stmInfoTextRef}
                        className="text22 max-sm:text-[5.2vw]! w-[85vw] max-sm:w-[85vw] py-40 max-w-125 leading-[1.4]! text-center text-white pointer-events-auto"
                        style={{
                            margin: 0,
                            visibility: "hidden",
                        }}
                    >
                        Vault is easiest to understand when you feel it. Preview a few
                        high-impact effects below, then open the full catalog when you are
                        ready.
                    </h2>
                    
                </div>
            </div>
        </section>
    );
}
