'use client'

import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import gsap from 'gsap'
import MaskTextReveal from '../mask-text-reveal'
import DeveloperCard from './for-developers/DeveloperCard'
import { groups, STRIP_GRADIENT } from './for-developers/groups'
import { useDeveloperAccordion } from './for-developers/useDeveloperAccordion'

export default function ForDevelopers() {
    const containerRef = useRef(null)
    const accordionRef = useRef(null)
    const headingRef = useRef(null)
    const stripContainerRef = useRef(null)
    const router = useRouter()
    const pathname = usePathname()

    const openWorkWithHyperiux = () => {
        router.push(`${pathname}?work-with-hyperiux=open`, { scroll: false })
    }

    useDeveloperAccordion(containerRef, accordionRef, headingRef)

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.set('.strip', { yPercent: 100 })

            gsap.to('.strip', {
                yPercent: -100,
                stagger: 0.08,
                duration: (i) => 1 - i * 0.14,
                ease: 'none',
                scrollTrigger: {
                    trigger: stripContainerRef.current,
                    start: '20% 100%',
                    end: '220% 100%',
                    scrub: true,
                },
            })
        }, stripContainerRef)

        return () => ctx.revert()
    }, [])

    return (
        <div ref={containerRef}>
            <section
            id='for-developers'
                ref={accordionRef}
                className="h-[300vh] mt-[-20vh] max-md:mt-0 w-full relative"
            >
                <div className="h-screen w-full  self-padd py-[2vw]! text-foreground sticky top-0 flex justify-between items-start max-md:flex-col">
                    <MaskTextReveal stagger={0.08} scrub={false} duration={2}>
                        <h2
                            ref={headingRef}
                            className="w-[33vw] font-medium text64 h-fit max-md:pt-22 max-sm:pt-[5vw] max-md:w-full tracking-tight max-sm:leading-tight! leading-[1.1]"
                        >
                            For Developers, Founders, Agencies, and Teams That
                            Need the Site to Feel as Premium as the Product.
                        </h2>
                    </MaskTextReveal>
                    <div className="relative w-[55vw] flex flex-col gap-[1vw] max-md:w-full max-md:gap-[2vw] max-md:mt-[4vw] max-sm:gap-[5vw] max-sm:mt-[5vw]">
                        {groups.map((group, idx) => (
                            <DeveloperCard
                                key={idx}
                                group={group}
                                onCtaClick={idx === 2 ? openWorkWithHyperiux : undefined}
                            />
                        ))}
                    </div>
                </div>
                <section
                    ref={stripContainerRef}
                    className="h-[200vh] max-sm:mt-[120vh] max-md:mt-[50vh] flex items-center justify-between w-full  bg-transparent pointer-events-none relative z-3"
                >
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className={`w-1/5 strip h-full max-sm:w-1/4 ${i === 4 ? 'max-sm:hidden ' : ''}`}
                            style={{ background: STRIP_GRADIENT }}
                        ></div>
                    ))}
                </section>
            </section>
        </div>
    )
}
