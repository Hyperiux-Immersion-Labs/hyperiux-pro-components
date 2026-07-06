"use client";

import React, { useRef } from "react";
import VaultBox from "../WebsiteComps/VaultBoxes";
import { useFadeUp } from "../Animations/gsapAnimations";
// import RandomBlur from "../WebsiteComps/RandomBlur";

const MOBILE_BOXES = [
    {
        id: "mobile-block-top-layer-1",
        img: 'https://h1r7ltksnzlh2a5c.public.blob.vercel-storage.com/videos/1.mp4',
       number: "01",
        label: "Scroll Effects",
        title: "Scroll Stack",
        paragraph: "For layered storytelling sections that need depth and progression.",
        containerLink: "/demo/scroll-stack",
        labelLink:"/effects/scroll-effects"
    },
    {
        id: "mobile-block-top-layer-2",
        img: 'https://h1r7ltksnzlh2a5c.public.blob.vercel-storage.com/videos/2.mp4',
       number: "02",
        label: "Text Animations",
        title: "Blur Text",
        paragraph: "For hero headlines, launch copy, and key messages that should reveal with control.",
        containerLink: "/demo/blur-text",
        labelLink:"/effects/text-animations"
    },
    {
        id: "mobile-block-top-layer-3",
        img: 'https://h1r7ltksnzlh2a5c.public.blob.vercel-storage.com/videos/3.mp4',
        number: "03",
        label: "WebGL",
        title: "WebGL Slider",
        paragraph: "For immersive product, portfolio, or campaign visuals.",
        textColor: "text-black",
        containerLink: "/demo/webgl-slider",
        labelLink: "/effects/webgl"
    },
    {
        id: "mobile-block-bottom-layer-1",
        img: 'https://h1r7ltksnzlh2a5c.public.blob.vercel-storage.com/videos/4.mp4',
         number: "04",
        label: "page Transitions",
        title: "Page Flip Transition",
        paragraph: "For portfolios and editorial experiences where route changes should feel authored.",
        containerLink: "/demo/page-flip-transition",
        labelLink: "/effects/page-transitions"
    },
    {
        id: "mobile-block-bottom-layer-2",
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
        id: "mobile-block-bottom-layer-3",
        img: 'https://h1r7ltksnzlh2a5c.public.blob.vercel-storage.com/videos/6.mp4',
        number: "06",
        label: "Components",
        title: "Animated FAQ",
        paragraph: "Dogfood your own product in the objection-handling section.",
        containerLink: "/demo/animated-faq",
        labelLink:  "/effects/components"
    },

];

export default function VaultGridNewMobile() {
    const containerRef = useRef(null);

    useFadeUp(containerRef);

    return (
        <section
            ref={containerRef}
            id="vault-grid-mobile"
            className="w-full self-padd overflow-clip py-[20vw] gap-[20vw] flex flex-col items-center justify-center md:hidden"
        >
           
            {/* Vertically Stacked Card Boxes (Exact same UI structure and classnames as desktop VaultBox) */}
            <div className="flex items-center justify-center flex-col max-sm:flex-col w-full max-sm:gap-[8vw] gap-[4vw]">
                {MOBILE_BOXES.map((box, idx) => {
                    // Indices for "second , fourth 6tgh" (i.e. 2nd, 4th, 6th): idx 1, 3, 5
                    const extraHeight =
                        idx === 1 || idx === 3 || idx === 5
                            ? "aspect-[16/16]" // taller aspect ratio
                            : "aspect-[16/10]";
                    return (
                        <VaultBox
                            key={box.id}
                            {...box}
                            styles={`fadeup w-[45%] shrink-0 max-md:w-[90%] max-sm:w-full ${extraHeight} max-md:!p-5`}
                        />
                    );
                })}
            </div>
   
        </section>
    );
}
