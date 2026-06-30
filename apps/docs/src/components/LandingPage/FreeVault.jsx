'use client'
import React, { useEffect, useRef } from "react";
import Button from "../WebsiteComps/Button";
import { useUser } from "@clerk/nextjs";
import { CheckIcon } from "@/utils/Icons";
import SplitLine from "../WebsiteComps/SplitLine";
import RandomBlur from "../WebsiteComps/RandomBlur";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const freeEffects = [
    "Scroll Systems",
    "Cursor Interactions",
    "Text Animation",
    "Navigation Patterns",
    "Page Transitions",
];

const proBenefits = [
    "Premium Effects Packs",
    "Complete Website Sections",
    "Advanced Motion Systems",
    "Priority Support",
    "Exclusive Experimental Releases",
];

export default function FreeVault() {
    const freeRef = useRef(null);
    const proRef = useRef(null);
    const { isSignedIn, user } = useUser();
    const userPlan = isSignedIn ? (user?.publicMetadata?.plan || "free") : null;

    useEffect(() => {
        const mm = gsap.matchMedia();

        mm.add("(min-width: 641px)", () => {
            gsap.fromTo(
                [freeRef.current, proRef.current],
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
            gsap.set('#Workflow', {
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

        return () => ctx.revert()
    }, [])

    return (
        <section
            id="FreeVault"
            className="h-fit relative z-10 bg-white text-background py-[10vw]! pt-[15vw] max-sm:pt-[40vw]! max-md:pb-[30vw]! gap-[2vw] max-md:gap-[8vw] flex-col w-full px-[5vw] max-md:px-[8vw] flex items-center justify-center overflow-x-hidden  max-md:pt-[10vw]"
        >
            <SplitLine as="p"
                className="text22 text-light-grey">
                Free Vault
            </SplitLine>

            <RandomBlur as="h2" className="text140 text-center w-[75vw] max-md:w-[90vw]">
                Everything you need today is free.
            </RandomBlur>
            <SplitLine delay={0.3} as="p" className="text34 text-center mt-[4vw] max-md:mt-[6vw] w-[65vw] max-md:w-[90vw]">
                Get early access to premium effect packs, complete website sections, founder pricing,
                and experimental releases before anyone else.
            </SplitLine>

            <div className="w-full max-md:flex-col-reverse flex max-md:gap-[6vw] max-md:mt-[10vw] gap-[2.5vw] items-end mt-[4vw] flex-col">
                <div className="w-fit max-md:mx-auto! max-md:mt-[6vw] fadeup">
                    <Button className='border border-primary' text="Explore All Effects" href="/effects" />
                </div>
                <div className="w-full max-md:flex-col-reverse max-md:gap-[8vw] max-md:h-auto flex h-[45vw] items-center gap-[2vw] justify-between">
                    <div
                        ref={freeRef}
                        className="w-1/2 max-md:w-full py-[4vw] max-md:py-[8vw] text-background! px-[3vw] max-md:px-[6vw] h-full max-md:h-auto flex flex-col items-start justify-between rounded-md bg-[#F6F6F6] max-md:gap-[8vw]"
                    >
                        <p className="text80 font-medium!">
                            Start with <br />
                            30+ Free Effects.
                        </p>
                        <ul className="list-none flex flex-col gap-[.7vw] max-md:gap-[3vw]">
                            {freeEffects.map((effect) => (
                                <li key={effect} className="flex items-center gap-[1vw] text24">
                                    <CheckIcon className="size-[1vw] max-md:size-[4vw]" />
                                    {effect}
                                </li>
                            ))}
                        </ul>
                        <div className="flex flex-col items-start space-y-[1vw] max-md:space-y-[4vw]">
                            <Button text="Get Free Access" href="/effects/free" />
                            <p className="text20 text-light-grey ">
                                No Credit Card Required
                            </p>
                        </div>
                    </div>

                    <div
                        ref={proRef}
                        className="w-1/2 max-md:w-full py-[4vw] max-md:py-[8vw] px-[3vw] max-md:px-[6vw] h-full max-md:h-auto flex flex-col items-start justify-between rounded-md bg-primary text-white max-md:gap-[8vw]"
                    >
                        <h3 className="text80 font-medium!">
                            Get Full<br />
                            Vault Access.
                        </h3>
                        <p className="text24">Unlock Everything:</p>

                        <ul className="list-none flex flex-col gap-[.5vw] max-md:gap-[3vw]">
                            {proBenefits.map((benefit) => (
                                <li key={benefit} className="flex items-center gap-[1vw] text24">
                                    <CheckIcon className="size-[1vw] max-md:size-[4vw]" />
                                    {benefit}
                                </li>
                            ))}
                        </ul>

                        <div className="flex flex-col items-start space-y-[1vw] max-md:space-y-[4vw]">
                            {userPlan === "pro" ? (
                                <Button text="Explore Effects" href="/effects" variant="black" />
                            ) : userPlan === "free" ? (
                                <Button text="Upgrade to Pro" href="/pricing" variant="black" />
                            ) : (
                                <Button text="Get Started" href="/sign-up" variant="black" />
                            )}
                            <p className="text20">
                                No Credit Card Required.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
