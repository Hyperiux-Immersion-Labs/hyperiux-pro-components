'use client'
import React, { useEffect, useRef } from "react";
import Button from "../Reusable/Button";
import { CheckIcon } from "@/utils/Icons";
import SplitLine from "../Reusable/SplitLine";
import RandomBlur from "../Reusable/RandomBlur";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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
    const freeRef = useRef(null);
    const waitlistRef = useRef(null);

    useEffect(() => {
        const mm = gsap.matchMedia();

        mm.add("(min-width: 641px)", () => {
            gsap.fromTo(
                [freeRef.current, waitlistRef.current],
                {
                    xPercent: (index) => (index === 0 ? -100 : 100),
                },
                {
                    xPercent: 0,
                    ease: "linear",
                    scrollTrigger: {
                        trigger: "#FreeVault",
                        start: "top 80%",
                        end: "85% 80%",
                        scrub: true,
                        markers: false,
                    },
                }
            );
        });

        return () => mm.revert();
    }, []);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.set('#FreeVault', {
                backgroundColor: '#0e0e0e',
                color: '#ffffff',
            })
            gsap.set('#AgencyProof', {
                backgroundColor: '#fff',
                color: '#0e0e0e',
            })

            const colorSwitchTimeline = gsap.timeline({
                scrollTrigger: {
                    trigger: '#FreeVault',
                    start: '10% 70%',
                    end: '120% 70%',
                    markers: false,
                    onEnter: () => {
                        gsap.to('#FreeVault', {
                            backgroundColor: '#fff',
                            color: '#0e0e0e',
                            duration: 0.4,
                            ease: 'linear',
                        })
                        gsap.to('#LeftBlur', {
                            background: 'linear-gradient(to right, #fff, rgba(255,255,255,0.7), transparent)',
                            duration: 0.4,
                            ease: 'linear',
                        })
                        gsap.to('#RightBlur', {
                            background: 'linear-gradient(to left, #fff, rgba(255,255,255,0.7), transparent)',
                            duration: 0.4,
                            ease: 'linear',
                        })

                        gsap.to('#Workflow', {
                            backgroundColor: '#fff',
                            color: '#0e0e0e',
                            duration: 0.4,
                            ease: 'linear',
                        }, "<")
                        gsap.to('#marquee-svg', {
                            filter: 'invert(1)',
                            duration: 0.4,
                            ease: 'linear',
                        }, "<")
                    },
                    onLeaveBack: () => {
                        gsap.to('#FreeVault', {
                            backgroundColor: '#0e0e0e',
                            color: '#ffffff',
                            duration: 0.4,
                            ease: 'linear',
                        })
                        gsap.to('#marquee-svg', {
                            filter: 'invert(0)',
                            duration: 0.4,
                            ease: 'linear',
                        }, "<")
                        gsap.to('#Workflow', {
                            backgroundColor: '#0e0e0e',
                            color: '#ffffff',
                            duration: 0.4,
                            ease: 'linear',
                        }, "<")
                        gsap.to('#LeftBlur', {
                            background: 'linear-gradient(to right, #0e0e0e, rgba(14,14,14,0.7), transparent)',
                            duration: 0.4,
                            ease: 'linear',
                        })
                        gsap.to('#RightBlur', {
                            background: 'linear-gradient(to left, #0e0e0e, rgba(14,14,14,0.7), transparent)',
                            duration: 0.4,
                            ease: 'linear',
                        })

                    },
                    onLeave: () => {

                        gsap.to('#FreeVault', {
                            backgroundColor: '#0e0e0e',
                            color: '#ffffff',
                            duration: 0.4,
                            ease: 'linear',
                        })
                        gsap.fromTo('#AgencyProof', {
                            backgroundColor: '#fff',
                            color: '#0e0e0e',
                        }, {
                            backgroundColor: '#0e0e0e',
                            color: '#ffffff',
                            duration: 0.4,
                            ease: 'linear',
                        })
                    },
                    onEnterBack: () => {
                        gsap.to('#FreeVault', {
                            backgroundColor: '#fff',
                            color: '#0e0e0e',
                            duration: 0.4,
                            ease: 'linear',
                        })
                        gsap.to('#AgencyProof', {
                            backgroundColor: '#fff',
                            color: '#0e0e0e',
                            duration: 0.4,
                            ease: 'linear',
                        })
                    }
                },
            })




        })
    }, [])

    return (
        <section
            id="FreeVault"
            className="h-fit relative z-10 bg-foreground text-background py-[10vw]! max-sm:pt-[20vw]! max-sm:pb-[30vw]! gap-[2vw] max-sm:gap-[8vw] flex-col w-full px-[5vw] max-sm:px-[8vw] flex items-center justify-center overflow-x-hidden"
        >
            <p className="text22 text-light-grey">Free Vault</p>
            <RandomBlur as="h2" className="text140 text-center w-[75vw] max-sm:w-[90vw]">
                Everything you need today is free.
            </RandomBlur>
            <SplitLine delay={0.3} as="p" className="text34 text-center mt-[4vw] max-sm:mt-[6vw] w-[65vw] max-sm:w-[90vw]">
                Get early access to premium effect packs, complete website sections, founder pricing,
                and experimental releases before anyone else.
            </SplitLine>

            <div className="w-full max-sm:flex-col-reverse flex max-sm:gap-[6vw] max-sm:mt-[10vw] gap-[2.5vw] items-end mt-[4vw] flex-col">
                <div className="w-fit max-sm:mx-auto! max-sm:mt-[6vw]">
                    <Button text="Explore All Effects" href="/effects" />
                </div>
                <div className="w-full max-sm:flex-col-reverse max-sm:flex-col max-sm:gap-[8vw] max-sm:h-auto flex h-[80vh] items-center gap-[2vw] justify-between">
                    <div
                        ref={freeRef}
                        className="w-1/2 max-sm:w-full py-[4vw] max-sm:py-[8vw] text-background! px-[3vw] max-sm:px-[6vw] h-full max-sm:h-auto flex flex-col items-start justify-between rounded-sm bg-[#F6F6F6] max-sm:gap-[8vw]"
                    >
                        <p className="text80 font-medium!">
                            Start with <br />
                            20 Free Effects.
                        </p>
                        <ul className="list-none flex flex-col gap-[.7vw] max-sm:gap-[3vw]">
                            {freeEffects.map((effect) => (
                                <li key={effect} className="flex items-center gap-[1vw] text24">
                                    <CheckIcon className="size-[1vw] max-sm:size-[4vw]" />
                                    {effect}
                                </li>
                            ))}
                        </ul>
                        <div className="flex flex-col items-start space-y-[1vw] max-sm:space-y-[4vw]">
                            <Button text="Get Free Access" href="/effects" />
                            <p className="text20 text-light-grey ">
                                No Credit Card Required
                            </p>
                        </div>
                    </div>

                    <div
                        ref={waitlistRef}
                        className="w-1/2 max-sm:w-full py-[4vw] max-sm:py-[8vw] px-[3vw] max-sm:px-[6vw] h-full max-sm:h-auto flex flex-col items-start justify-between rounded-sm bg-primary text-white max-sm:gap-[8vw]"
                    >
                        <h3 className="text80 font-medium!">
                            Join the<br />
                            Founding Waitlist.
                        </h3>
                        <p className="text24">Get Early Access To:</p>

                        <ul className="list-none flex flex-col gap-[.5vw] max-sm:gap-[3vw]">
                            {waitlistBenefits.map((benefit) => (
                                <li key={benefit} className="flex items-center gap-[1vw] text24">
                                    <CheckIcon className="size-[1vw] max-sm:size-[4vw]" />
                                    {benefit}
                                </li>
                            ))}
                        </ul>

                        <div className="flex flex-col items-start space-y-[1vw] max-sm:space-y-[4vw]">
                            <Button text="Join Waitlist" href="/waitlist" variant="black" />
                            <p className="text20">
                                No Spam. Unsubscribe Anytime.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
