import React from "react";
import Button from "../Reusable/Button";
import { CheckIcon } from "@/utils/Icons";

const freeEffects = [
    "Scroll systems",
    "Cursor Interactions",
    "Text Animation",
    "Navigation Patterns",
    "Page Transitions",
];

const waitlistBenefits = [
    "Premium Effects Packs",
    "Complete Website Sections",
    "Advanced Motion Systems",
    "Founder Pricing",
    "Exclusive Experimental Releases",
];

export default function FreeVault() {
    return (
        <section
            id="FreeVault"
            className="h-fit bg-foreground text-background py-[10vw]! gap-[2vw] flex-col w-full px-[5vw]  flex items-center justify-center"
        >
            <p className="text22 text-light-grey">Free Vault</p>
            <h2 className="text140  text-center w-[80vw]">
                Everything you need today is free.
            </h2>
            <p className="text34 text-center mt-[4vw] w-[65vw]">
                Get early access to premium effect packs, complete website sections, founder pricing,
                and experimental releases before anyone else.
            </p>

            <div className="w-full flex gap-[2.5vw] items-end mt-[4vw] flex-col ">
                <div className="w-fit mr-[1vw]">
                    <Button text="Explore All Effects" href="/effects" />
                </div>
                <div className="w-full flex h-[80vh] items-center gap-[2vw] justify-between">
                    <div className="w-1/2 py-[4vw] px-[3vw] h-full flex flex-col items-start justify-between rounded-md bg-[#F6F6F6]">
                        <p className="text80 font-medium!">Start with <br />
                            20 Free Effects.</p>
                        <ul className="list-none flex flex-col gap-[.7vw]">
                            {freeEffects.map((effect) => (
                                <li key={effect} className="flex items-center gap-[1vw] text24">
                                    <CheckIcon className="size-[1vw]" />
                                    {effect}
                                </li>
                            ))}
                        </ul>
                        <div className="space-y-[1vw]">
                            <Button text="Get Free Access" href="/effects" />
                            <p className="text20 text-light-grey ">No Credit Card Required</p>
                        </div>
                    </div>

                    <div className="w-1/2 py-[4vw] px-[3vw] h-full flex flex-col items-start justify-between rounded-md bg-primary text-white ">
                        <h3 className="text80 font-medium!">Join the<br />
                            Founding Waitlist.</h3>
                        <p className="text24">Get Early Access To:</p>

                        <ul className="list-none flex flex-col gap-[.5vw]">
                            {waitlistBenefits.map((benefit) => (
                                <li key={benefit} className="flex items-center gap-[1vw] text24">
                                    <CheckIcon className="size-[1vw] " />
                                    {benefit}
                                </li>
                            ))}
                        </ul>

                        <div className="space-y-[1vw]">
                            <Button text="Join Waitlist" href="/waitlist" variant="black" />
                            <p className="text20">No Spam. Unsubscribe Anytime.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
