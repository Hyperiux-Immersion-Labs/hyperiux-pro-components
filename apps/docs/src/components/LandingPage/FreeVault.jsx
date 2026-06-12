'use client'
import React, { useEffect, useRef } from "react";
import Button from "../Reusable/Button";
import { CheckIcon } from "@/utils/Icons";
import SplitLine from "../Reusable/SplitLine";
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
        const ctx = gsap.context(() => {
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

        return () => ctx.revert();
    }, []);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.set('#FreeVault', {
                backgroundColor: '#0e0e0e',
                color: '#ffffff',
            })
            const colorSwitchTimeline = gsap.timeline({
                scrollTrigger: {
                    trigger: '#FreeVault',
                    start: '0% 70%',
                    end: '80% 70%',
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
            className="h-fit relative z-10 bg-foreground text-background py-[10vw]! gap-[2vw] flex-col w-full px-[5vw] flex items-center justify-center"
        >
            <p className="text22 text-light-grey">Free Vault</p>
            <SplitLine as="h2" className="text140  text-center w-[80vw]">
                Everything you need today is free.
            </SplitLine>
            <SplitLine delay={0.2} as="p" className="text34 text-center mt-[4vw] w-[65vw]">
                Get early access to premium effect packs, complete website sections, founder pricing,
                and experimental releases before anyone else.
            </SplitLine>

            <div className="w-full flex gap-[2.5vw] items-end mt-[4vw] flex-col ">
                <div className="w-fit mr-[1vw]">
                    <Button text="Explore All Effects" href="/effects" />
                </div>
                <div className="w-full flex h-[80vh] items-center gap-[2vw] justify-between">
                    <div
                        ref={freeRef}
                        className="w-1/2 py-[4vw] text-background! px-[3vw] h-full flex flex-col items-start justify-between rounded-md bg-[#F6F6F6]"
                    >
                        <p className="text80 font-medium!">
                            Start with <br />
                            20 Free Effects.
                        </p>
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
                            <p className="text20 text-light-grey ">
                                No Credit Card Required
                            </p>
                        </div>
                    </div>

                    <div
                        ref={waitlistRef}
                        className="w-1/2 py-[4vw] px-[3vw] h-full flex flex-col items-start justify-between rounded-md bg-primary text-white "
                    >
                        <h3 className="text80 font-medium!">
                            Join the<br />
                            Founding Waitlist.
                        </h3>
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
