'use client'

import React, { useEffect, useRef, useCallback } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'
import { SplitText } from 'gsap/dist/SplitText'
import { prefersReducedMotion } from '@/lib/motion'

// Only register on client
if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger, SplitText)
}

export default function GradientFill() {
    const containerRef = useRef(null)
    const textRefs = useRef([]) // Only initialized once, don't clear on render

    // Safe callback to collect text refs
    const addTextRef = useCallback((el) => {
        if (el && !textRefs.current.includes(el)) {
            textRefs.current.push(el)
        }
    }, [])

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const splits = []
        let ctx

        // ponytail: this section is well below the fold; the SplitText calls
        // below were firing on page mount along with every other section's,
        // contributing to the layout-thrash storm. Defer until near viewport.
        const mount = () => {
            ctx = gsap.context(() => {
                const glow = containerRef.current.querySelector('.radial-glow-fill')

                // Use matchMedia for mobile/desktop selective animation
                const mm = gsap.matchMedia()
                mm.add(
                    {
                        isMobile: "(max-width: 767px)",
                        isDesktop: "(min-width: 768px)",
                    },
                    (context) => {
                        // Mobile styles: translate more
                        if (context.conditions.isMobile) {
                            gsap.set(glow, {
                                scaleX: 1,
                                yPercent: 160,
                                scaleY: 1,
                                transformOrigin: "bottom center",
                                willChange: "transform, opacity"
                            })

                            const tl2 = gsap.timeline({
                                scrollTrigger: {
                                    trigger: containerRef.current,
                                    start: "top 50%",
                                    end: "bottom 50%",
                                    scrub: true,
                                    markers: false,
                                },
                                ease: 'none',
                            })
                            tl2.to(glow, {
                                yPercent: 80,
                                duration: 2,
                            })

                            tl2.to(glow, {
                                yPercent: 40,
                                duration: 2,
                                opacity: 1.0,
                            })
                        }
                        // Desktop styles: original
                        if (context.conditions.isDesktop) {
                            gsap.set(glow, {
                                scaleX: 1,
                                yPercent: 120,
                                scaleY: 1,
                                transformOrigin: "bottom center",
                                willChange: "transform, opacity"
                            })

                            const tl2 = gsap.timeline({
                                scrollTrigger: {
                                    trigger: containerRef.current,
                                    start: "top center",
                                    end: "bottom center",
                                    scrub: true,
                                    // markers: true,
                                },
                                ease: 'none',
                            })
                            tl2.to(glow, {
                                yPercent: 40,
                                duration: 2,
                            })

                            tl2.to(glow, {
                                yPercent: -10,
                                duration: 2,
                                opacity: 1.0,
                            })
                        }
                    }
                )

                // ---- Text Animations ----
                const reducedMotion = prefersReducedMotion()

                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "10% center",
                        end: "75% center",
                        scrub: 1,
                        markers: false
                    }
                })

                textRefs.current.forEach((el, index) => {
                    const isLast = index === textRefs.current.length - 1

                    // Paragraphs are stacked; even with reduced motion they must
                    // cross-fade in sequence so all three are readable.
                    if (reducedMotion) {
                        gsap.set(el, { willChange: 'opacity' })
                        tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 1, ease: 'power2.out' })
                        if (!isLast) {
                            tl.to(el, { opacity: 0, duration: 1, ease: 'power2.in' })
                        }
                        return
                    }

                    const split = new SplitText(el, { type: 'words,lines,chars', aria: 'none' })
                    splits.push(split)

                    gsap.set(el, { opacity: 1 })
                    gsap.set(split.chars, {
                        willChange: 'transform, opacity',
                        transformOrigin: '50% 50%',
                        backfaceVisibility: 'hidden',
                        force3D: true
                    })

                    tl.fromTo(
                        split.chars,
                        { opacity: 0, stagger: 0.02, filter: 'blur(5px)' , scale:1.02 },
                        { opacity: 1, stagger: 0.02,  filter: 'blur(0px)', duration: 1, ease: 'power2.out' , scale:1}
                    )
                    if (!isLast) {
                        tl.to(
                            split.chars,
                            { opacity: 0, stagger: 0.02,  filter: 'blur(5px)', duration: 1, ease: 'power2.in' , scale:0.98 }
                        )
                    }
                })

                // Clean up GSAP matchMedia on destroy
                return () => mm.revert()
            }, containerRef)
        }

        const io = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) {
                    io.disconnect()
                    mount()
                }
            },
            { rootMargin: "500px 0px" }
        )
        io.observe(container)

        // Clean up GSAP splits/context
        return () => {
            io.disconnect()
            splits.forEach(split => split.revert())
            ctx?.revert()
        }
    }, [])

    return (
        <section ref={containerRef} className="h-[240vh] mt-[-10vw] relative w-full bg-[#0e0e0e]">
            <div className="w-full sticky top-0 z-99 h-screen flex justify-center items-center overflow-x-clip">

                {/* CSS Radial Glow, using the 'fill' style & class from CTA2.jsx */}
                <div
                    className="radial-glow-fill size-[75vw]  absolute bottom-0 left-1/2 rounded-full -translate-x-1/2 pointer-events-none z-0 bg-[#ff5f00] blur-[200px] max-md:size-[150vw] max-md:left-1/2 max-md:blur-[100px] max-md:bottom-[40%]"

                ></div>

                {[
                    'Most websites are not broken. They are forgettable.',
                    'The difference now lives in the interaction layer: how the page moves, responds, reveals, transitions, and guides attention.',
                    'Your site does not need more decoration. It needs motion that earns its place.',
                ].map((text, i) => (
                    <p
                        key={i}
                        ref={addTextRef}
                        className="text64 leading-[1.2] font-heading absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-99 w-[72vw] max-md:w-[85vw] mx-auto text-center pointer-events-none text-white"
                    >
                        {text}
                    </p>
                ))}
            </div>
        </section>
    )
}
