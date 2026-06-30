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
    const textRef = useRef(null)

    useEffect(() => {
        let split;

        const ctx = gsap.context(() => {
            split = new SplitText(textRef.current, { type: 'lines' })

            gsap.set(textRef.current, { perspective: 2000 })
            gsap.set(split.lines, { willChange: 'transform, opacity', transformOrigin: '50% 50%' })

            const glow = containerRef.current.querySelector('.radial-glow');
            gsap.set(glow, { opacity: 0.2, scale: 0.8, transformOrigin: 'bottom center', willChange: 'transform, opacity' })

            // Separate standalone ScrollTrigger for the glow so it can animate slower!
            gsap.to(glow, {
                opacity: 0.8,
                scale: 3,
                ease: 'none',
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "8% bottom", // Starts exactly when the section enters the viewport
                    end: "bottom top",   // Ends exactly when the section leaves the viewport (max stretch)
                    scrub: true, // Extra smooth catch-up
                }
            })

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "-20% top",
                    end: "bottom bottom",
                    scrub: 1.5, // Buttery smooth scrub
                }
            })

            // 1. Text enters
            tl.fromTo(split.lines,
                { rotationX: -15, yPercent: 100, opacity: 0 },
                { rotationX: 0, yPercent: 0, opacity: 1, stagger: 0.2, duration: 1, ease: 'none' },
                0
            )

            // 2. Text holds & Glow holds
            tl.to({}, { duration: 1 }, 1)

            // 3. Text swings up and out (Glow stays!)
            tl.to(split.lines,
                { rotationX: 15, yPercent: -100, opacity: 0, stagger: 0.2, duration: 1, ease: 'none' },
                2
            )

        }, containerRef)

        return () => {
            if (split) split.revert();
            ctx.revert();
        }
    }, [])

    return (
        <section ref={containerRef} className='h-[200vh] relative w-full bg-[#0e0e0e]'>
            <div className='w-full sticky top-0 z-99 h-screen flex justify-center items-center'>

                {/* Pure CSS Radial Glow (No Canvas!) */}
                <div
                    className='radial-glow w-[100vw] h-[50vw] absolute bottom-[-15vw] left-1/2 rounded-full -translate-x-1/2 pointer-events-none z-0'
                    style={{ background: 'radial-gradient(50% 50% at 50% 50%, #ff5f00 0%, transparent 100%)' }}
                ></div>

                <p ref={textRef} className='text64 relative z-99 w-[72vw] mx-auto text-center pointer-events-none text-white'>
                    Most websites are not broken. They are forgettable. They use the same sections, the same rhythm, the same static patterns, and the same safe animations everyone else is using.
                </p>
            </div>
        </section>
    )
}

