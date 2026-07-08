"use client";

import {
    FAQContent,
    FAQGroup,
    FAQTitle,
    FAQWrapper,
} from "@/components/animated-faq";
import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import RandomBlur from "../WebsiteComps/RandomBlur";
import LinkButton from "../WebsiteComps/LinkButton";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

export default function FAQs({ faqItems, isHomePage = false,fixWidth=false }) {
    const containerRef = useRef(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const INITIAL_COUNT = 5;

    const defaultOpenItems = faqItems
        .filter((item) => item.defaultOpen)
        .map((item) => item.id);

    useEffect(() => {
        if (!isHomePage) return;

        const ctx = gsap.context(() => {
            gsap.to('.faq-gradient', {
                y: "-15vw",
                ease: 'none',
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top bottom',
                    end: 'top 20%',
                    scrub: true
                }
            });
        }, containerRef);

        return () => ctx.revert();
    }, [isHomePage]);

    const visibleFaqItems = isExpanded
        ? faqItems
        : faqItems.slice(0, INITIAL_COUNT);

    return (
        <section ref={containerRef} className="h-full w-full pb-[10vw]! text-white relative">
            {isHomePage && (
                <div className="pointer-events-none">
                    <div className="faq-gradient absolute top-0 left-0 w-full h-[30vw] bg-linear-to-b from-white via-primary to-background max-sm:h-[30vh] z-4"></div>
                    <div className="h-[30vw] max-sm:h-[30vh]"></div>
                </div>
            )}
            {!isHomePage && <div className="h-[10vw]"></div>}

            <div className="mx-auto text-center text-white max-sm:mb-[14vw] mb-[6vw] relative z-10">
                <RandomBlur as="h2" className='text110 w-full max-w-[70vw] max-sm:max-w-full text-center mx-auto'>
                    Questions <span className='text-primary'>Answered.</span>
                </RandomBlur>
            </div>
            <div className={`mx-auto w-full max-md:max-w-[90%] max-sm:max-w-full   ${fixWidth ? ' max-w-[70vw] max-sm:w-[87%]' : ''}`}>
                <FAQGroup allowMultiple={false} defaultOpenItems={defaultOpenItems}>
                    {visibleFaqItems.map((item) => (
                                <FAQWrapper
                                    key={item.id}
                                    itemId={item.id}
                                    className="rounded-md border border-white/20 px-6 py-5 fadeup mb-4"
                                    titleClassName="text-[1.1rem] font-medium text-white"
                                    iconSize={16}
                                    iconStrokeWidth={2}
                                    duration={0.5}
                                >
                                    <FAQTitle iconPosition="left" className="pb-0 text-[1.5vw] max-sm:text-[5vw] max-md:text-[3.2vw] max-md:leading-[1.3] max-sm:leading-[1.3]">
                                        <h3>
                                            {item.question}
                                        </h3>
                                    </FAQTitle>

                                    <FAQContent className="pt-4 w-[80%] max-md:w-[95%] text22 max-sm:text-[4vw]! max-md:text-[2.5vw]! pl-10">
                                        {item.answer}
                                    </FAQContent>
                                </FAQWrapper>
                    ))}
                </FAQGroup>
                {!isExpanded && faqItems.length > INITIAL_COUNT && (
                <div className="w-full flex items-center justify-center mt-[4vw]">
                                            <LinkButton href={"#"} onClick={() => setIsExpanded(true)} shimmer tilted={false} showArrow  text={"View More"}/>
                
                </div>
                )}
            </div>
        </section>
    );
}
