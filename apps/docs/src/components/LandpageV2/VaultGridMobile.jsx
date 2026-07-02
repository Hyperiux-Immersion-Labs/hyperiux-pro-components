"use client";

import React from "react";
import VaultBox from "../WebsiteComps/VaultBoxes";
// import RandomBlur from "../WebsiteComps/RandomBlur";

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
        label: "Cursor Effects"
    },
    {
        id: "mobile-block-top-layer-3",
        img: '/video/3.mp4',
        number: "03",
        label: "WebGL",
        textColor: "text-black",
    },
    {
        id: "mobile-block-bottom-layer-1",
        img: '/video/4.mp4',
        number: "04",
        label: "Text Animations"
    },
    {
        id: "mobile-block-bottom-layer-2",
        img: '/video/5.mp4',
        number: "05",
        label: "Page Transitions",
        textColor: "text-black",
    },
    {
        id: "mobile-block-bottom-layer-3",
        img: '/video/6.mp4',
        number: "06",
        label: "Navigations"
    },

];

export default function VaultGridNewMobile() {
    return (
        <section
            id="vault-grid-mobile"
            className="w-full self-padd overflow-x-hidden py-[20vw] gap-[20vw] flex flex-col items-center justify-center md:hidden"
        >
           
            {/* Vertically Stacked Card Boxes (Exact same UI structure and classnames as desktop VaultBox) */}
            <div className="flex items-center justify-center flex-wrap max-sm:flex-col w-full max-sm:gap-[8vw] gap-[4vw]">
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
                            styles={`w-[45%] shrink-0 max-sm:w-full ${extraHeight} max-md:!p-5`}
                        />
                    );
                })}
            </div>
   
        </section>
    );
}
