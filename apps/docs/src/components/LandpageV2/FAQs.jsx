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

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

export default function FAQs({ faqItems }) {
    const containerRef = useRef(null);
    const [visibleCount, setVisibleCount] = useState(5);

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
                <RandomBlur as="h2" className='text110 w-[70%] text-center mx-auto'>
                    Questions, <span className='text-primary'>Answered.</span>
                </RandomBlur>
            </div>
            <div className="mx-auto w-[75vw] space-y-4 max-md:space-y-8 max-sm:space-y-6">
                <FAQGroup allowMultiple={false} defaultOpenItems={defaultOpenItems}>
                    {faqItems.slice(0, visibleCount).map((item) => (
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
                {visibleCount < faqItems.length && (
                <div className="w-full flex mt-[4vw] items-center justify-center">
                    <span onClick={() => setVisibleCount(faqItems.length)} className="relative group flex items-center gap-[.5vw] w-fit cursor-pointer">

                        <span className="relative overflow-hidden inline-flex h-[1.3em]">
                            <span className="inline-block transition-transform duration-300 group-hover:-translate-y-full">View More</span>
                            <span className="inline-block absolute left-0 top-0 translate-y-full transition-transform duration-300 group-hover:translate-y-0">View More</span>
                        </span>

                        <svg className="transition-transform duration-300 group-hover:translate-y-[3px]" width="10" height="13" viewBox="0 0 10 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.24036 7.72066C8.30902 7.64697 8.39182 7.58787 8.48382 7.54688C8.57582 7.50589 8.67513 7.48384 8.77583 7.48207C8.87654 7.48029 8.97656 7.49882 9.06995 7.53654C9.16334 7.57426 9.24817 7.6304 9.31939 7.70162C9.39061 7.77284 9.44676 7.85767 9.48448 7.95106C9.5222 8.04445 9.54072 8.14448 9.53895 8.24518C9.53717 8.34588 9.51513 8.4452 9.47414 8.5372C9.43314 8.6292 9.37404 8.712 9.30035 8.78066L5.30035 12.7807C5.15973 12.9211 4.9691 13 4.77035 13C4.5716 13 4.38098 12.9211 4.24035 12.7807L0.240354 8.78066C0.166667 8.712 0.107565 8.6292 0.0665735 8.5372C0.0255818 8.4452 0.00354045 8.34588 0.00176376 8.24518C-1.2927e-05 8.14448 0.0185113 8.04445 0.0562319 7.95106C0.0939526 7.85767 0.150098 7.77284 0.221317 7.70162C0.292535 7.6304 0.377369 7.57426 0.470758 7.53654C0.564147 7.49882 0.664174 7.48029 0.764877 7.48207C0.86558 7.48384 0.964894 7.50589 1.05689 7.54688C1.14889 7.58787 1.23169 7.64697 1.30035 7.72066L4.02035 10.4407L4.02036 0.750659C4.02036 0.551747 4.09937 0.360981 4.24003 0.220329C4.38068 0.0796762 4.57144 0.000659508 4.77036 0.000659526C4.96927 0.000659543 5.16003 0.0796762 5.30069 0.220329C5.44134 0.360982 5.52036 0.551747 5.52036 0.75066L5.52035 10.4407L8.24036 7.72066Z" fill="white" />
                        </svg>

                        <span className="w-full h-px bg-white absolute -bottom-2 left-0 scale-x-0 origin-right group-hover:origin-left group-hover:scale-x-100 transition-transform duration-300" />
                    </span>
                </div>
                )}
            </div>
        </section>
    );
}
