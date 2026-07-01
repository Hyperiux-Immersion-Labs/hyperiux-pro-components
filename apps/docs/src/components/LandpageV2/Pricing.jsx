"use client";

import React, { useState, useEffect, useRef, memo } from "react";
import gsap from "gsap";
import ShimmerText from "../WebsiteComps/ShimmerText";
import { CheckIcon } from "../../utils/Icons";
import Button from "../WebsiteComps/Button";
import RandomBlur from "../WebsiteComps/RandomBlur";
import SplitLine from "../WebsiteComps/SplitLine";

const DIGITS = [...Array(10).keys()];

const PriceDigit = memo(({ digit, visible = true }) => {
    const containerRef = useRef(null);
    const hasMounted = useRef(false);

    useEffect(() => {
        if (!containerRef.current) return;
        const target = `-${parseInt(digit, 10) * 10}%`;
        if (!hasMounted.current) {
            gsap.set(containerRef.current, { y: target });
            hasMounted.current = true;
        } else {
            gsap.to(containerRef.current, { y: target, duration: 0.55, ease: "power3.out" });
        }
    }, [digit]);

    return (
        <span
            className="overflow-hidden h-[1em] leading-none inline-block relative transition-all duration-300"
            style={{ width: visible ? "0.64em" : "0", opacity: visible ? 1 : 0 }}
        >
            <span ref={containerRef} className="flex flex-col will-change-transform">
                {DIGITS.map((d) => (
                    <span key={d} className="flex h-[1em] items-center justify-center leading-none">
                        {d}
                    </span>
                ))}
            </span>
        </span>
    );
});

PriceDigit.displayName = "PriceDigit";

const freeFeatures = [
    "30+ production-ready effects",
    "Copy-paste + CLI install",
    "Commercial-friendly usage",
    "Code you own"
];
const ProFeatures = [
    "All 100+ effects, scroll, cursor, text, transitions, WebGL, nav, backgrounds, buttons",
    "New effects added regularly.",
    "Priority access to upcoming packs",
    "Hyperiux CLI install + auth",
    "Dependency, performance & reduced-motion notes per effect",
    "Code you own, commercial-friendly",
];

export default function Pricing() {
    const [isYearly, setIsYearly] = useState(true);

    return (
        <div className="h-fit max-sm:hidden text-background  max-md:overflow-hidden flex pb-[6vw]! flex-col gap-[10vw] items-center justify-center min-h-screen pt-[45vw]! bg-foreground self-padd  w-full">
            <div className=" text-center space-y-[4vw]">
                <RandomBlur as="h2"  className="text110 w-[70vw]">
                    Start free. Upgrade when you’re ready.
                </RandomBlur>
                <SplitLine as="p" className="text24">
                    The free core stays free, forever. Pro unlocks everything and every
                    new drop.
                </SplitLine>
            </div>
            <div className="h-[58vw] max-md:h-[350vw]! max-md:flex-col max-md:gap-[4vw] relative w-full flex gap-[1.5vw]">

                <div className="h-full max-md:w-full px-[4vw] flex-col py-[3vw] flex items-start justify-between w-1/2 bg-[#F0F0F0]">
                    <div className="space-y-[1.5vw]">

                        <p className="text80 mb-[4vw]">Free</p>
                        <div className="flex gap-[1vw] items-end">
                            <p className="text110">$0</p>
                            <p className="text24 mb-[1vw]">Forever</p>
                        </div>
                        <p className="text24 -mt-[1vw]">For trying real effects in real projects.</p>
                        <div className="flex flex-col gap-[1.5vw] pt-[2vw]">
                            {freeFeatures.map((feature, index) => (
                                <div key={index} className="flex items-center gap-[1vw]">
                                    <CheckIcon className="w-[1.5vw] h-[1.5vw] max-md:w-5 max-md:h-5 shrink-0" />
                                    <p className="text24 leading-none max-md:text-base">{feature}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <Button variant="outline" href="/effects/free" text="Browse Free Effects" className="mb-[2.5vw]" />
                </div>

                {/* TOGGLE */}
                <div className="h-fit max-md:w-full rounded-md absolute right-[32vw] flex items-center text24 text-background top-[-2.8vw] gap-[1vw] z-0">
                    <p
                        className={`cursor-pointer transition-opacity duration-300`}
                        onClick={() => setIsYearly(false)}
                    >
                        Monthly
                    </p>
                    <button
                        onClick={() => setIsYearly(!isYearly)}
                        className="p-[.2vw] bg-primary relative flex items-center w-[3.5vw] h-[1.8vw] rounded-full transition-colors duration-300"
                        aria-label="Toggle billing cycle"
                    >
                        <span
                            className={`h-[1.4vw] w-[1.4vw] rounded-full bg-foreground transition-transform duration-300 absolute ${isYearly ? "translate-x-[1.7vw]" : "translate-x-0"}`}
                        />
                    </button>
                    <p
                        className={`cursor-pointer transition-opacity duration-300 `}
                        onClick={() => setIsYearly(true)}
                    >
                        Yearly
                    </p>
                </div>
                <div className="h-full max-md:w-full relative px-[4vw] flex-col py-[3vw] flex items-start justify-between w-1/2 bg-background text-foreground">

                    <div className="space-y-[1.5vw]">

                        <p className="text80">Pro</p>
                        <ShimmerText as="p" className="text24 font-medium -mt-[1vw]">Most Popular</ShimmerText>

                        <div className="flex gap-[1vw] items-end">
                            <p className="text110 flex items-center">
                                <span>$</span>
                                <PriceDigit digit="1" visible={isYearly} />
                                <PriceDigit digit={isYearly ? "7" : "2"} />
                                <PriceDigit digit="0" />
                            </p>
                            <p className="text24 mb-[1vw]">{isYearly ? "Yearly" : "Monthly"}</p>
                            <p className={`text34 mb-[.75vw] ml-[1vw] text-primary transition-opacity duration-300 ${isYearly ? "opacity-100" : "opacity-0 pointer-events-none"}`}>3 Months Free</p>
                        </div>
                        <p className="text24 -mt-[1vw]">For developers, founders, and agencies shipping premium work.</p>
                        <div className="flex flex-col gap-[1.5vw] pt-[2vw]">
                            {ProFeatures.map((feature, index) => (
                                <div key={index} className="flex items-start  gap-[1vw]">
                                    <CheckIcon className="w-[1.5vw] h-[1.5vw] mt-[.25vw] max-md:w-5 max-md:h-5 shrink-0" />
                                    <p className="text24 max-md:text-base">{feature}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-[1vw] w-fit">
                        <div className="w-fit">

                            <Button variant="orange" text="Get PRO" />
                        </div>
                        <p className="text-light-grey">Instant access · npx hyperiux login · Cancel anytime</p>
                    </div>
                </div>
            </div>
            <SplitLine as="p" className="text34 relative z-50 text-center w-[45vw]">
                Cancel anytime. The free core stays free forever. Every effect lives in
                your repo. So even if you leave, your code stays.
            </SplitLine>
        </div>
    );
}
