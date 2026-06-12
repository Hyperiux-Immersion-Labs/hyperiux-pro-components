'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'
import { SplitText } from 'gsap/dist/SplitText'

gsap.registerPlugin(ScrollTrigger, SplitText)

export default function SectionBreak() {
    const textRef = useRef(null)

    useEffect(() => {
        if (!textRef.current) return

        const split = SplitText.create(textRef.current, {
            type: 'chars',
            charsClass: 'char',
        })

        const ctx = gsap.context(() => {
            gsap.fromTo(
                split.chars,
                {
                    opacity: 0,
                    filter: 'blur(10px)',
                },
                {
                    opacity: 1,
                    filter: 'blur(0px)',
                    stagger: 0.03,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: textRef.current,
                        start: 'top 80%',
                        end: 'bottom',
                        scrub: true,
                        markers: false,
                    },
                }
            )
        })

        return () => {
            ctx.revert()
            split.revert()
        }
    }, [])

    return (
        <section className="h-screen relative w-full  flex items-center justify-center bg-background">
            <h2
                ref={textRef}
                className="text140 w-[60vw] text-center"
            >
                Not another static component kit.
            </h2>
        </section>
    )
}