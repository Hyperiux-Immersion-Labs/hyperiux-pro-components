'use client'

import React, { useEffect, useRef, useCallback } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'
import { SplitText } from 'gsap/dist/SplitText'

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
        const splits = []
        const ctx = gsap.context(() => {
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
                            opacity: 0.3,
                            scaleX: 1,
                            yPercent: 220,
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
                            scale: 2,
                            yPercent: 100,
                            opacity: .5,
                            duration: 2,
                        })
                        
                        tl2.to(glow, {
                            scale: 3.2,
                            yPercent: 0,
                            duration: 2,
                            opacity: 1.0,
                        })
                    }
                    // Desktop styles: original
                    if (context.conditions.isDesktop) {
                        gsap.set(glow, {
                            opacity: 0.3,
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
                            scale: 1.5,
                            yPercent: 70,
                            opacity: .5,
                            duration: 2,
                        })
                       
                        tl2.to(glow, {
                            scale: 2.5,
                            yPercent: 30,
                            duration: 2,
                            opacity: 1.0,
                        })
                    }
                }
            )

            // ---- Text Animations (unchanged) ----
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "10% center",
                    end: "95% center",
                    scrub: 1,
                    markers: false
                }
            })

            textRefs.current.forEach((el) => {
                const split = new SplitText(el, { type: 'lines' })
                splits.push(split)

                gsap.set(el, { perspective: 2000, opacity: 1 })
                gsap.set(split.lines, {
                    willChange: 'transform, opacity',
                    transformOrigin: '50% 50%',
                    backfaceVisibility: 'hidden',
                    force3D: true
                })

                tl.fromTo(
                    split.lines,
                    { rotationX: -30, yPercent: 200, opacity: 0 },
                    { rotationX: 0, yPercent: 0, opacity: 1, stagger: 0.1, duration: 1, ease: 'power2.out' }
                )
                tl.to(
                    split.lines,
                    { rotationX: 30, yPercent: -200, opacity: 0, stagger: 0.1, duration: 1, ease: 'power2.in' }
                )
            })

            // Clean up GSAP matchMedia on destroy
            return () => mm.revert()
        }, containerRef)

        // Clean up GSAP splits/context
        return () => {
            splits.forEach(split => split.revert())
            ctx.revert()
        }
    }, [])

    return (
        <section ref={containerRef} className="h-[240vh] mt-[-10vw] relative w-full bg-[#0e0e0e]">
            <div className="w-full sticky top-0 z-99 h-screen flex justify-center items-center overflow-x-clip">

                {/* CSS Radial Glow, using the 'fill' style & class from CTA2.jsx */}
                <div
                    className="radial-glow-fill w-screen max-sm:left-1/2 max-sm:w-[170vw] h-[50vw] max-sm:h-[60vh] absolute bottom-0 max-sm:bottom-[-30vw] left-1/2 rounded-full -translate-x-1/2 pointer-events-none z-0"
                    style={{
                        background: 'radial-gradient(50% 50% at 50% 50%, #ff5f00 0%, transparent 100%)'
                    }}
                ></div>

                {[
                    'Most websites are not broken. They are forgettable.',
                    'The difference now lives in the interaction layer: how the page moves, responds, reveals, transitions, and guides attention.',
                    'Your site does not need more decoration. It needs motion that earns its place.',
                ].map((text, i) => (
                    <p
                        key={i}
                        ref={addTextRef}
                        className="text64 leading-[1.2] font-heading absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-99 w-[72vw] max-sm:w-[85vw] mx-auto text-center pointer-events-none text-white"
                    >
                        {text}
                    </p>
                ))}
            </div>
        </section>
    )
}
