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
                stagger: 0.08,
                duration: (i) => 1 - (i * 0.16), // left is 1s, right is faster
                ease: 'none',
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: '100% 180%', // Start when container enters from bottom
                    end: '220% 100%', // End when container is fully in view
                    scrub: true,
                    // markers: true,
                }
            })
            // gsap.to(".pricing",{
            //     ypercent: -20,

            // })
        }, containerRef)

        return () => ctx.revert()
    }, [])

    return (
        <section ref={containerRef} className="h-[200vh] mt-[-220vh] max-[1025px]:mt-[-260vh]  flex max-md:mt-[-150vh] items-center justify-between w-full  bg-transparent pointer-events-none relative z-3">
            {[...Array(5)].map((_, i) => (
                <div
                    key={i}
                    className="w-1/5 strip h-full"
                    style={{
                        background: `
      linear-gradient(
        to bottom,
        #0e0e0e 0%,
        #0e0e0e 15%,
        #b35a22 28%,
        #ff5f00 40%,
        #ff5f00 60%,
        #ff5f00 80%,
        #ffffff 100%
      )
    `,
                    }}
                ></div>
            ))}
        </section>

    )
}
