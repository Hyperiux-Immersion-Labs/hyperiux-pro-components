"use client";

import React, { memo, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import ButtonV3 from "../components/ButtonV3";
import LineReveal from "@/components/Animations/LineReveal";
import SplitLine from "@/components/WebsiteComps/SplitLine";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const PLANS = {
    monthly: { price: "20", label: "Monthly" },
    yearly: { price: "179", label: "Yearly" },
};

const FREE_FEATURES = [
    "30+ production-ready effects",
    "Copy-paste + CLI install",
    "Commercial-friendly usage",
    "Code you own",
];

const PRO_FEATURES = [
    "All 115 effects",
    "New effects added regularly",
    "Priority access to upcoming packs",
    "Hyperiux CLI install + auth",
    "Dependency, performance & reduced-motion notes per effect",
    "Code you own, commercial-friendly",
];

const DIGITS = [...Array(10).keys()];

/** A single price digit on a vertical reel, so the number rolls on plan change. */
const PriceDigit = memo(function PriceDigit({ digit, visible = true }) {
    const reelRef = useRef(null);
    const hasMounted = useRef(false);

    useEffect(() => {
        if (!reelRef.current) return;

        const y = `-${Number(digit) * 10}%`;

        // First paint rests on the right digit instead of animating up to it.
        if (!hasMounted.current) {
            hasMounted.current = true;
            gsap.set(reelRef.current, { y });
            return;
        }

        gsap.to(reelRef.current, { y, duration: 0.55, ease: "power3.out" });
    }, [digit]);

    return (
        <span
            aria-hidden="true"
            className="relative inline-block h-[1em] w-[0.64em] overflow-hidden leading-none transition-[width,opacity] duration-300"
            style={{ width: visible ? undefined : 0, opacity: visible ? 1 : 0 }}
        >
            <span ref={reelRef} className="flex flex-col will-change-transform">
                {DIGITS.map((d) => (
                    <span key={d} className="flex h-[1em] items-center justify-center">
                        {d}
                    </span>
                ))}
            </span>
        </span>
    );
});

function CheckSquare({ className = "", onDark = false }) {
    return (
        <svg
            viewBox="0 0 18 18"
            fill="none"
            aria-hidden="true"
            className={`shrink-0 ${className}`}
        >
            <rect width="18" height="18" fill="currentColor" />
            <path
                d="M4.5 9.2L7.6 12.3L13.5 5.9"
                stroke={onDark ? "#0e0e0e" : "#ffffff"}
                strokeWidth="1.6"
                strokeLinecap="square"
                strokeLinejoin="miter"
            />
        </svg>
    );
}

function FeatureList({ features, className = "", onDark = false }) {
    return (
        <ul className={`flex flex-col gap-[1.2vw] max-md:gap-[3vw] max-sm:gap-[4.5vw] ${className}`}>
            {features.map((feature) => (
                <li key={feature} className="flex items-start gap-[1vw] max-md:gap-[2.5vw] max-sm:gap-[3.5vw]">
                    <CheckSquare
                        onDark={onDark}
                        className="mt-[0.25vw] size-[1.1vw] max-md:mt-[0.6vw] max-md:size-[2.4vw] max-sm:mt-[0.8vw] max-sm:size-[4vw]"
                    />
                    <span className="text22 leading-[1.35] max-md:text-[2.2vw] max-sm:text-[4vw]">
                        {feature}
                    </span>
                </li>
            ))}
        </ul>
    );
}

function BillingToggle({ isYearly, onChange }) {
    return (
        <div className="flex items-center gap-[1vw] text22 max-md:gap-[2.5vw] max-md:text-[2.2vw] max-sm:gap-[3.5vw] max-sm:text-[4vw]">
            <button type="button" onClick={() => onChange(false)} className="cursor-pointer">
                Monthly
            </button>

            <button
                type="button"
                role="switch"
                aria-checked={isYearly}
                aria-label="Toggle billing cycle"
                onClick={() => onChange(!isYearly)}
                className="relative flex h-[1.5vw] w-[3vw] cursor-pointer items-center border border-background/20 bg-background/5 p-[0.2vw] max-md:h-[3.4vw] max-md:w-[6.8vw] max-md:p-[0.5vw] max-sm:h-[5.5vw] max-sm:w-[11vw] max-sm:p-[0.8vw]"
            >
                <span
                    className={`h-full w-1/2 bg-primary transition-transform duration-300 ${isYearly ? "translate-x-full" : "translate-x-0"
                        }`}
                />
            </button>

            <button type="button" onClick={() => onChange(true)} className="cursor-pointer">
                Yearly
            </button>
        </div>
    );
}

export default function PricingV3() {
    const container = useRef(null);
    const [isYearly, setIsYearly] = useState(true);

    const plan = isYearly ? PLANS.yearly : PLANS.monthly;

    // Both cards rise into place once, as the section scrolls in.
    useGSAP(
        () => {
            const cards = gsap.utils.toArray(".pricing-v3-card");

            gsap.fromTo(
                cards,
                { opacity: 0, y: "2vw" },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    stagger: 0.12,
                    ease: "power3.out",
                    scrollTrigger: { trigger: container.current, start: "top 75%", once: true },
                },
            );
        },
        { scope: container },
    );

    return (
        <section
            ref={container}
            id="pricing"
            className="relative z-10 w-full bg-foreground  mt-[-20vw] pt-0! pb-[10vw]! text-background max-md:py-[14vw] max-sm:py-[20vw]"
        >
            {/* HEADING */}
            <div className="text-center w-full">
                <LineReveal as="h2" className="t96 w-full font-neue-haas ">
                    Start Free. Upgrade When You&rsquo;re{" "}
                    <span className="gradient-text-animate">Ready.</span>
                </LineReveal>

                <SplitLine delay={.25} as="p" className="text24 w-full  mx-auto mt-[1.5vw] text-background max-md:mt-[4vw] max-md:w-[70vw] max-md:text-[2.2vw] max-sm:mt-[6vw] max-sm:w-full max-sm:text-[4vw]">
                    The free core stays free, forever. Pro unlocks everything and every new drop.
                </SplitLine>
            </div>

            {/* TOGGLE */}
            <div className="mt-[4vw] px-[8%] flex justify-end max-md:mt-[8vw] max-sm:mt-[12vw] max-sm:justify-center">
                <BillingToggle isYearly={isYearly} onChange={setIsYearly} />
            </div>

            {/* CARDS */}
            <div className="mt-[1.5vw] w-[85%] mx-auto flex items-stretch max-md:mt-[5vw] max-md:flex-col-reverse max-md:gap-[6vw] max-sm:gap-[8vw]">
                {/* FREE */}
                <div className="pricing-v3-card flex w-1/2 flex-col justify-between border border-background/15 px-[3vw] py-[3vw] max-md:w-full max-md:px-[5vw] max-md:py-[6vw] max-sm:px-[6vw] max-sm:py-[8vw]">
                    <div>
                        <p className="t64  max-md:text-[5vw] font-neue-haas max-sm:text-[7vw]">Free</p>

                        <div className="mt-[1.5vw] flex items-end gap-[1vw] max-md:mt-[4vw] max-md:gap-[2.5vw] max-sm:mt-[6vw]">
                            <p className="t96 font-neue-haas  leading-none max-md:text-[7vw] max-sm:text-[11vw]">
                                $0
                            </p>
                            <p className="text22 mb-[0.4vw] max-md:text-[2.2vw] max-sm:text-[4vw]">
                                Forever
                            </p>
                        </div>

                        <p className="text22  mt-[1.5vw] text-background/70 max-md:mt-[3vw] max-md:text-[2.2vw] max-sm:mt-[5vw] max-sm:text-[4vw]">
                            For trying real effects in real projects.
                        </p>

                        <FeatureList
                            features={FREE_FEATURES}
                            className="mt-[2.5vw] max-md:mt-[5vw] max-sm:mt-[8vw]"
                        />
                    </div>

                    <div className="mt-[3vw] pb-[2.5vw] w-fit max-md:mt-[6vw] max-sm:mt-[10vw] max-sm:w-full">
                        <ButtonV3
                            variant="outline"
                            href="/effects/free"
                            text="Browse Free Effects"
                            className="text-background max-sm:w-full max-sm:justify-center"
                        />
                    </div>
                </div>

                {/* PRO */}
                <div className="pricing-v3-card relative flex w-1/2 flex-col justify-between bg-background px-[3vw] py-[3vw] text-foreground max-md:w-full max-md:px-[5vw] max-md:py-[6vw] max-sm:px-[6vw] max-sm:py-[8vw]">
                    {/* Four-square mark, the Pro badge from the design */}
                    <span
                        aria-hidden="true"
                        className="absolute top-[1.5vw] right-[1.5vw] grid grid-cols-2 gap-[0.15vw] max-md:top-[4vw] max-md:right-[4vw] max-md:gap-[0.4vw] max-sm:gap-[0.6vw]"
                    >
                        {Array.from({ length: 4 }).map((_, i) => (
                            <span
                                key={i}
                                className="size-[0.5vw] bg-primary max-md:size-[1.2vw] max-sm:size-[1.8vw]"
                            />
                        ))}
                    </span>

                    <div>
                        <p className="t64 font-neue-haas  max-md:text-[5vw] max-sm:text-[7vw]">Pro</p>

                        <div className="mt-[1.5vw] flex items-end gap-[1vw] max-md:mt-[4vw] max-md:gap-[2.5vw] max-sm:mt-[6vw]">
                            <p
                                className="t96 font-neue-haas  flex leading-none max-md:text-[7vw] max-sm:text-[11vw]"
                                aria-label={`$${plan.price} ${plan.label.toLowerCase()}`}
                            >
                                <span aria-hidden="true">$</span>
                                <PriceDigit digit="1" visible={isYearly} />
                                <PriceDigit digit={isYearly ? "7" : "2"} />
                                <PriceDigit digit={isYearly ? "9" : "0"} />
                            </p>

                            <p className="text22 mb-[0.4vw] max-md:text-[2.2vw] max-sm:text-[4vw]">
                                {plan.label}
                            </p>

                            <p
                                className={`text22 mb-[0.4vw] text-primary transition-opacity duration-300 max-md:text-[2.2vw] max-sm:text-[4vw] ${isYearly ? "opacity-100 delay-300" : "opacity-0"
                                    }`}
                            >
                                3 months free
                            </p>
                        </div>

                        <p className="text22  mt-[1.5vw] max-md:mt-[3vw] max-md:text-[2.2vw] max-sm:mt-[5vw] max-sm:text-[4vw]">
                            For developers, founders, and agencies shipping premium work.
                        </p>

                        <FeatureList
                            features={PRO_FEATURES}
                            onDark
                            className="mt-[2.5vw] max-md:mt-[5vw] max-sm:mt-[8vw]"
                        />
                    </div>

                    <div className="mt-[3vw] max-md:mt-[6vw] max-sm:mt-[10vw]">
                        <div className="w-fit max-sm:w-full">
                            <ButtonV3
                                variant="orange"
                                href="/sign-up"
                                text="Upgrade to Pro"
                                className="max-sm:w-full max-sm:justify-center"
                            />
                        </div>

                        <p className="font-geist-mono mt-[1.2vw] text-[0.9vw] text-light-grey max-md:mt-[3vw] max-md:text-[1.8vw] max-sm:mt-[5vw] max-sm:text-[3.2vw]">
                            Instant access · npx hyperiux login · Cancel anytime
                        </p>
                    </div>
                </div>
            </div>

            {/* FOOTNOTE */}
            <SplitLine as="p" className="text32  mx-auto mt-[5vw] w-[52vw] text-center leading-[1.35] max-md:mt-[10vw] max-md:w-[75vw]  max-sm:mt-[14vw] max-sm:w-[90%] ">
                Cancel anytime. The free core stays free forever. Every effect lives in
                your repo. So even if you leave, your code stays.
            </SplitLine>
        </section>
    );
}
