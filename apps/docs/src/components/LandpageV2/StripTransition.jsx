'use client'

import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger)
}

export default function StripTransition() {
    const containerRef = useRef(null)

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Start strips below the container
            gsap.set('.strip', { yPercent: 100 })
            
            // Animate them up to their natural position
            gsap.to('.strip', {
                yPercent: -100,
                stagger: 0.05,
                ease: 'none',
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: '100% center', // Start when container enters from bottom
                    end: '200% center', // End when container is fully in view
                    scrub: true,
                    markers:false,
                }
            })
        }, containerRef)

        return () => ctx.revert()
    }, [])

    return (
        <section ref={containerRef} className="h-[150vh] -mt-[70vw] flex items-center justify-between w-full  bg-transparent pointer-events-none">
            {[...Array(5)].map((_, i) => (
                <div key={i} className='strip w-1/5 h-full bg-gradient-to-b from-background from-20% via-primary via-70% to-foreground l'></div>
            ))}
        </section>
    )
}
