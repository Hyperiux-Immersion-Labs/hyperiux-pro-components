"use client";

import React from "react";
import { ArrowUpRightIcon } from "@/utils/Icons";
import VaultBox from "../WebsiteComps/VaultBoxes";
import RandomBlur from "../WebsiteComps/RandomBlur";

const MOBILE_BOXES = [
    {
        id: "mobile-block-top-layer-1",
        img: '/video/1.mp4',
        number: "01",
        label: "Scroll Effects"
    },
    {
        id: "mobile-block-top-layer-2",
        img: '/video/2.mp4',
        number: "02",
        label: "Hover Reveal"
    },
    {
        id: "mobile-block-top-layer-3",
        img: '/video/3.mp4',
        number: "03",
        label: "Parallax Layers"
    },
    {
        id: "mobile-block-bottom-layer-1",
        img: '/video/4.mp4',
        number: "04",
        label: "Transitions"
    },
    {
        id: "mobile-block-bottom-layer-3",
        img: '/video/6.mp4',
        number: "05",
        label: "GSAP Magic"
    },
    {
        id: "mobile-block-bottom-layer-2",
        img: '/video/1.mp4',
        number: "06",
        label: "Text Split"
    },
    
];

export default function VaultGridMobile() {
    return (
        <section
            id="vault-grid-mobile"
            className="w-full self-padd overflow-x-hidden py-[20vw] gap-[20vw] flex flex-col items-center justify-center sm:hidden"
        >
            {/* Intro Text Block */}
            <h2
                className="text80 text-center font-medium  text-white  w-full"
            >
                Hyperiux Vault is built around the
                interaction layer of a website, the moments people notice when they scroll,
                hover, move, navigate, read, and explore.
            </h2>

            {/* Vertically Stacked Card Boxes (Exact same UI structure and classnames as desktop VaultBox) */}
            <div className="flex flex-col w-full gap-[8vw]">
                {MOBILE_BOXES.map((box) => (
                    <VaultBox 
                        key={box.id} 
                        {...box} 
                        styles="w-full aspect-[16/10] max-sm:!p-5" 
                    />
                ))}
            </div>
        </section>
    );
}
