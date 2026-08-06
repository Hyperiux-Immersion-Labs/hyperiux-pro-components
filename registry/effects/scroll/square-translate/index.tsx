// Built using Hyperiux Vault: https://vault.hyperiux.com

import React from "react";

import SquareTranslateComp from "./SquareTranslateComp";

const items = [
    "Websites, web apps, landing pages",
    "Animation and interaction design",
    "Figma to production code",
    "Core Web Vitals and load time optimization",
    "Webflow development",
    "React / Next.js / Vue / Nuxt development",
    "GSAP / Framer Motion animation",
    "Unlimited revisions",
    "Direct Slack communication",
    "Senior developers on every project",
];

export default function SquareTranslate() {
    return (
        <>
      <div className="w-full bg-white h-[200vh] pt-[50vh] px-[20vw]">

            <SquareTranslateComp
                items={items}
                textClassName="text-[1.1vw] max-[1025px]:text-xl"
                textColor="text-black"
                squareClassName="w-[.6vw] h-[.6vw] max-[1025px]:w-3 max-[1025px]:h-3 bg-[#FB450F]"
                containerClassName="w-[50vw]  max-[1025px]:w-full"
                translateValue={55}
                borderColor="border-black/10"
                totalTranslateImpact={3}
            />
      </div>


        </>
    );
}
