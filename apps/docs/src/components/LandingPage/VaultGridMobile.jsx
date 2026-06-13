"use client";

import React from "react";
import { ArrowUpRightIcon } from "@/utils/Icons";

const MOBILE_BOXES = [
    {
        id: "block-top-layer-1",
        img: '/video/1.mp4',
        number: "01",
        label: "Scroll Effects"
    },
    {
        id: "block-top-layer-2",
        img: '/video/2.mp4',
        number: "02",
        label: "Hover Reveal"
    },
    {
        id: "block-top-layer-3",
        img: '/video/3.mp4',
        number: "03",
        label: "Parallax Layers"
    },
    {
        id: "block-bottom-layer-1",
        img: '/video/4.mp4',
        number: "04",
        label: "Transitions"
    },
    {
        id: "block-bottom-layer-2",
        img: '/video/1.mp4',
        number: "05",
        label: "Text Split"
    },
    {
        id: "block-bottom-layer-3",
        img: '/video/6.mp4',
        number: "06",
        label: "GSAP Magic"
    }
];

export default function VaultGridMobile() {
    return (
        <section
            id="vault-grid-mobile"
            className="w-full bg-[#0e0e0e] py-[20vw] px-6 flex flex-col items-center justify-center sm:hidden"
        >
            {/* Intro Text Block */}
            <h2
                className="text24 text-center font-medium leading-[1.4] text-white mb-12 w-full"
            >
                Hyperiux Vault is built <span className="text-primary">around</span> the
                interaction layer of a website, the moments people notice when they scroll,
                hover, move, navigate, read, and explore.
            </h2>

            {/* Vertically Stacked Card Boxes (Exact same UI structure and classnames as desktop VaultBox) */}
            <div className="flex flex-col w-full gap-5">
                {MOBILE_BOXES.map((box) => (
                    <div
                        key={box.id}
                        className="w-full aspect-[16/10] relative"
                    >
                        <div
                            id={box.id}
                            className="flex p-[1vw] max-sm:p-5 overflow-hidden justify-between relative h-full rounded-md w-full h-full border border-white/5 bg-[#080808]"
                        >
                            <div className="absolute inset-0 bg-black/50">
                                <video
                                    loop
                                    autoPlay
                                    playsInline
                                    muted
                                    src={box.img}
                                    className="object-cover h-full w-full"
                                />
                            </div>
                            <div className="relative z-2 flex justify-between h-full w-full">
                                <div className="text24 max-sm:text-xl">
                                    <p>{box.number}</p>
                                    <p className="max-sm:mt-1 font-semibold">{box.label}</p>
                                </div>
                                <div className="size-[2vw] max-sm:size-8 flex items-end">
                                    <ArrowUpRightIcon className="h-full w-full object-contain" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
