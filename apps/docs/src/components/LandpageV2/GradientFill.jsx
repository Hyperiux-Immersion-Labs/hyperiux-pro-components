'use client'

import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'
import { SplitText } from 'gsap/dist/SplitText'

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger, SplitText)
}

export default function GradientFill() {
    const containerRef = useRef(null)
    const textRefs = useRef([])
    textRefs.current = []

    const addTextRef = (el) => {
        if (el && !textRefs.current.includes(el)) textRefs.current.push(el)
    }

    useEffect(() => {
        const splits = []

        const ctx = gsap.context(() => {
            const glow = containerRef.current.querySelector('.radial-glow');
            gsap.set(glow, { opacity: 0.2, scale: 0.8, transformOrigin: 'bottom center', willChange: 'transform, opacity' })

            // Separate standalone ScrollTrigger for the glow so it can animate slower!
            gsap.to(glow, {
                opacity: 0.8,
                scale: 3,
                ease: 'none',
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "20% center", // Starts exactly when the section enters the viewport
                    end: "bottom center",   // Ends exactly when the section leaves the viewport (max stretch)
                    markers:false,
                    scrub: true, // Extra smooth catch-up
                }
            })

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "10% center",
                    end: "95% center",
                    scrub: true, // Buttery smooth scrub
                    markers:false,
                }
            })

            textRefs.current.forEach((el) => {
                const split = new SplitText(el, { type: 'lines' })
                splits.push(split)

                gsap.set(el, { perspective: 2000, opacity: 1 })
                gsap.set(split.lines, { willChange: 'transform, opacity', transformOrigin: '50% 50%' })

                // 1. Text enters from bottom, fading in
                tl.fromTo(split.lines,
                    { rotationX: -30, yPercent: 200, opacity: 0 },
                    { rotationX: 0, yPercent: 0, opacity: 1, stagger: 0.2, duration: 1, ease: 'none' }
                )

                // 2. Holds in place, then text swings up and out before the next paragraph starts
                tl.to(split.lines,
                    { rotationX: 30, yPercent: -200, delay:-.2, opacity: 0, stagger: 0.2, duration: 1, ease: 'none' },
                    "+=1"
                )
            })

        }, containerRef)

        return () => {
            splits.forEach((split) => split.revert());
            ctx.revert();
        }
    }, [])

    return (
        <section ref={containerRef} className='h-[400vh] -mt-[10vw] relative w-full bg-[#0e0e0e]'>
            <div className='w-full sticky top-0 z-99 h-screen flex justify-center items-center'>

                {/* Pure CSS Radial Glow (No Canvas!) */}
                <div
                    className='radial-glow w-[100vw] h-[50vw] absolute bottom-[-15vw] left-1/2 rounded-full -translate-x-1/2 pointer-events-none z-0'
                    style={{ background: 'radial-gradient(50% 50% at 50% 50%, #ff5f00 0%, transparent 100%)' }}
                ></div>

                {[
                    'Most websites are not broken. They are forgettable. They use the same sections, the same rhythm, the same static patterns, and the same safe animations everyone else is using.',
                    'The difference now lives in the interaction layer: how your page moves, responds, reveals, transitions, and guides attention.',
                    'But building that layer from scratch is slow & hard. Good motion needs taste, timing, restraint, performance discipline, cleanup, responsive behavior, mobile fallbacks and reduced-motion support. Most teams either skip it, overdo it, or rebuild the same interaction from scratch for every project.',
                ].map((text, i) => (
                    <p
                        key={i}
                        ref={addTextRef}
                        className='text64 leading-[1.2] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-99 w-[72vw] max-sm:w-[90vw] mx-auto text-center pointer-events-none text-white'
                        style={{ opacity: 0 }}
                    >
                        {text}
                    </p>
                ))}
            </div>
        </section>
    )
}
