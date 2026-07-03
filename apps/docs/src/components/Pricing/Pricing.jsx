"use client";

import React, { useState, useEffect, useRef, memo, useCallback } from "react";
import gsap from "gsap";
import { CheckIcon } from "../../utils/Icons";
import Button from "../WebsiteComps/Button";
import RandomBlur from "../WebsiteComps/RandomBlur";
import SplitLine from "../WebsiteComps/SplitLine";
import { useUser } from "@clerk/nextjs";

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
            className="overflow-hidden h-[1em] leading-none inline-block relative transition-all duration-300 [--pd-w:0.64em] max-sm:[--pd-w:0.52em]"
            style={{ width: visible ? "var(--pd-w)" : "0", opacity: visible ? 1 : 0 }}
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
    "All 100+ effects",
    "New effects added regularly.",
    "Priority access to upcoming packs",
    "Hyperiux CLI install + auth",
    "Dependency, performance & reduced-motion notes per effect",
    "Code you own, commercial-friendly",
];

export default function Pricing({padding,content=true}) {
    const [isYearly, setIsYearly] = useState(true);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [checkoutError, setCheckoutError] = useState("");

    const { isLoaded, isSignedIn, user } = useUser();
    const userPlan = isSignedIn ? (user?.publicMetadata?.plan || "free") : null;

    const handleUpgrade = useCallback(async () => {
        setCheckoutLoading(true);
        setCheckoutError("");
        try {
            const res = await fetch("/api/stripe/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ billingInterval: isYearly ? "yearly" : "monthly" }),
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                setCheckoutError(data.error || "Unable to start checkout. Please try again.");
                setCheckoutLoading(false);
            }
        } catch {
            setCheckoutError("Something went wrong. Please try again.");
            setCheckoutLoading(false);
        }
    }, [isYearly]);

    return (
        <div className={`h-fit text-background pricing  max-md:overflow-hidden flex pb-[6vw] flex-col gap-[10vw]  max-md:gap-[15vw] items-center justify-center min-h-screen  bg-foreground self-padd  w-full ${padding?padding:"pt-[35vw]! relative z-2 pb-[15vw]!"}`}>
            {content&&<div className=" text-center space-y-[4vw] max-md:space-y-[6vw]">
                <RandomBlur as="h2"  className="text110 w-[70vw] max-md:w-full">
                    Start free. Upgrade when you’re ready.
                </RandomBlur>
                <SplitLine as="p" className="text24 max-md:w-[90vw] mx-auto">
                    The free core stays free, forever. Pro unlocks everything and every
                    new drop.
                </SplitLine>
            </div>}
            <div id="pricing-cards" className="h-[55vw] max-md:h-fit max-md:flex-col max-md:gap-[8vw] relative w-full flex gap-[1.5vw] fadeup">

                <div className="h-full max-md:w-full px-[4vw] rounded-md max-md:p-[6vw] flex-col py-[3vw]  flex items-start max-md:gap-[10vw] justify-between w-1/2 bg-[#F0F0F0] max-sm:rounded-sm">
                    <div className="space-y-[1.5vw] max-md:space-y-[6vw]">

                        <p className="text80 font-medium!">Free</p>
                        <div className="flex gap-[1vw] max-md:gap-[3vw] items-end">
                            <p className="text110 max-sm:text-[13vw]! font-medium!">$0</p>
                            <p className="text24 mb-[1vw] max-md:mb-2">Forever</p>
                        </div>
                        <p className="text24 -mt-[1vw] max-md:mt-[-3.5vw]">For trying real effects in real projects.</p>
                        <div className="flex flex-col gap-[1.5vw] max-md:gap-[4.5vw] pt-[2vw]">
                            {freeFeatures.map((feature, index) => (
                                <div key={index} className="flex items-center max-md:gap-[3vw] gap-[1vw]">
                                    <CheckIcon className="w-[1.5vw] h-[1.5vw] max-md:w-[4vw] max-md:h-[4vw] shrink-0" />
                                    <p className="text24 leading-[1.4] max-md:text-[4.2vw]">{feature}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="w-fit max-md:w-full">
                        <Button variant="outline" href="/effects/free" text="Browse Free Effects" className="mb-[2.5vw] max-md:w-full max-md:mb-0" />
                    </div>
                </div>

                {/* TOGGLE */}
                <div className="h-fit max-md:w-full rounded-md absolute max-md:relative max-md:top-[4vw] max-md:right-0 max-md:justify-start right-0 flex  items-center text24 text-background top-[-2.8vw]  gap-[1vw] max-md:gap-[4vw] z-0">
                    <p
                        className={`cursor-pointer transition-opacity duration-300`}
                        onClick={() => setIsYearly(false)}
                    >
                        Monthly
                    </p>
                    <button
                        onClick={() => setIsYearly(!isYearly)}
                        className="p-[.2vw] max-md:p-[1vw] bg-primary relative flex items-center w-[3.5vw] max-md:w-[14vw] h-[1.8vw] max-md:h-[7vw] rounded-full transition-colors duration-300"
                        aria-label="Toggle billing cycle"
                    >
                        <span
                            className={`h-[1.4vw] max-md:h-[5vw] w-[1.4vw] max-md:w-[5vw] rounded-full bg-foreground transition-transform duration-300 absolute ${isYearly ? "translate-x-[1.7vw] max-md:translate-x-[7vw]" : "translate-x-0"}`}
                        />
                    </button>
                    <p
                        className={`cursor-pointer transition-opacity duration-300 `}
                        onClick={() => setIsYearly(true)}
                    >
                        Yearly
                    </p>
                </div>
                
                <div className="h-full rounded-md max-md:h-fit max-md:w-full max-md:p-[6vw] relative px-[4vw] max-sm:rounded-sm flex-col py-[3vw] flex items-start max-md:gap-[10vw] justify-between w-1/2 bg-background text-foreground">
                    <div className="space-y-[1.5vw] max-md:space-y-[6vw]">

                        <p className="text80">Pro</p>

                        <div className="flex gap-[1vw] max-md:gap-[2vw]  items-end">
                            <p className="text110 max-sm:text-[13vw]! flex items-center font-medium!">
                                <span>$</span>
                                <PriceDigit digit="1" visible={isYearly} />
                                <PriceDigit digit={isYearly ? "7" : "2"} />
                                <PriceDigit digit={isYearly ? "9" : "0"} />
                            </p>
                            <p className="text24 mb-[1vw] max-md:mb-2">{isYearly ? "Yearly" : "Monthly"}</p>
                            <p className={`text34 max-md:text-[4vw] font-medium! max-md:mb-2 mb-[.75vw] ml-[1vw]  text-primary transition-opacity duration-300 ${isYearly ? "opacity-100" : "opacity-0 pointer-events-none max-sm:text-nowrap!"}`}>3 Months Free</p>
                        </div>
                        <p className="text24 -mt-[1vw] max-sm:leading-[1.2] max-md:mt-0">For developers, founders, and agencies shipping premium work.</p>
                        <div className="flex flex-col gap-[1.5vw] max-md:gap-[3.5vw] pt-[2vw]">
                            {ProFeatures.map((feature, index) => (
                                <div key={index} className="flex items-center max-md:gap-[3vw] gap-[1vw]">
                                    <CheckIcon className="w-[1.5vw] h-[1.5vw] max-md:mt-0 max-md:w-[4vw] max-md:h-[4vw] shrink-0" />
                                    <p className="text24 leading-[1.4] max-md:text-[4.2vw]">{feature}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-[1vw] max-md:space-y-[4vw] w-fit max-md:w-full">
                        <div className="w-fit max-md:w-full">
                            {!isLoaded ? (
                                <Button variant="orange" text="···" className="max-md:w-full" disabled />
                            ) : userPlan === "pro" ? (
                                <Button variant="orange" text="Current Plan" className="max-md:w-full" disabled />
                            ) : userPlan === "free" ? (
                                <Button
                                    variant="orange"
                                    text={checkoutLoading ? "Loading..." : "Upgrade to Pro"}
                                    className="max-md:w-full"
                                    onClick={handleUpgrade}
                                    disabled={checkoutLoading}
                                    href="#"
                                    preventDefault
                                />
                            ) : (
                                <Button
                                    variant="orange"
                                    text="Get PRO"
                                    href="/sign-up"
                                    className="max-md:w-full"
                                />
                            )}
                        </div>
                        <p className="text-light-grey max-sm:text-center max-md:text-[3.2vw]">Instant access · npx hyperiux login · Cancel anytime</p>
                        {checkoutError && (
                            <p className="text-sm text-red-400">{checkoutError}</p>
                        )}
                    </div>
                </div>
            </div>
            <SplitLine as="p" className="text34 max-md:text-[5vw] max-md:leading-[1.3] relative z-50 text-center w-[45vw] max-md:w-[90vw]">
                Cancel anytime. The free core stays free forever. Every effect lives in
                your repo. So even if you leave, your code stays.
            </SplitLine>
        </div>
    );
}
