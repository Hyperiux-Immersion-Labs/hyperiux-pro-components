"use client";

import {
    FAQContent,
    FAQGroup,
    FAQTitle,
    FAQWrapper,
} from "@/components/animated-faq";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

export default function FAQs({ faqItems }) {
    const containerRef = useRef(null);

    const defaultOpenItems = faqItems
        .filter((item) => item.defaultOpen)
        .map((item) => item.id);

    useEffect(() => {
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
    }, []);

    return (
        <section ref={containerRef} className="h-full w-full pb-[10vw]! self-padd text-white relative">
            {/* Full-width gradient transition from the white Pricing section above */}
            <div className="faq-gradient absolute top-0 left-0 w-full h-[30vw] bg-gradient-to-b from-white via-primary to-background"></div>

            <div className="h-[30vw]"></div>

            <div className="mx-auto text-center text-white mb-[6vw] relative z-10">
                <h2 className='text-[5.5vw] w-[70%] text-center mx-auto'>
                    Questions, <span className='text-primary'>Answered.</span>
                </h2>
            </div>
            <div className="mx-auto w-[75vw] space-y-4 max-md:space-y-8 max-sm:space-y-6">
                <FAQGroup allowMultiple={false} defaultOpenItems={defaultOpenItems}>
                    {faqItems.map((item) => (
                        <FAQWrapper
                            key={item.id}
                            itemId={item.id}
                            className="rounded-md border border-white/20 px-6 py-5 fadeup"
                            titleClassName="text-[1.1rem] font-medium text-white"
                            iconSize={16}
                            iconStrokeWidth={2}
                            duration={0.5}
                        >
                            <FAQTitle iconPosition="left" className="pb-0 text-[1.5vw] max-sm:text-[5vw] max-md:text-[3.2vw] max-md:leading-[1.3] max-sm:leading-[1.3]">
                                <h3>
                                    {item.title}
                                </h3></FAQTitle>

                            <FAQContent className="pt-4  w-[80%] max-md:w-[95%] text22 max-sm:text-[4vw]! max-md:text-[2.5vw]!">
                                {item.content}
                            </FAQContent>
                        </FAQWrapper>
                    ))}
                </FAQGroup>
            </div>
        </section>
    );
}
