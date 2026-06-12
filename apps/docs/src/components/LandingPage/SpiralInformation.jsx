import { useRef, useEffect } from 'react'
import Button from '../Reusable/Button'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, SplitText)

export default function SpiralInformation() {
    const textRef = useRef(null)
    const buttonWrapperRef = useRef(null)
    useEffect(() => {
        const splittedParagraph = SplitText.create(textRef.current, {
            type: 'lines',
            mask: 'lines',
        })
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: '#spiral-images',
                    start: '47% center',
                    end: '80% center',
                    scrub: true,
                    markers: false,
                }
            })
            // 1. Reveal Phase
            tl.fromTo(splittedParagraph.lines, {
                yPercent: 100,
            }, {
                yPercent: 0,
                ease: 'power2.out',
                stagger: 0.04,
                duration: 1,
            })
            tl.fromTo(buttonWrapperRef.current, {
                opacity: 0,
                yPercent: 100,
            }, {
                opacity: 1,
                ease: 'power2.out',
                yPercent: 0,
                duration: 0.8,
            }, "-=0.3")

            // 2. Exit Phase (Scrolls UP and Fades Out)
            tl.to(splittedParagraph.lines, {
                yPercent: -130,
                opacity: 0,
                ease: 'power2.in',
                stagger: 0.02,
                duration: 1,
            }, "+=0.5") // hold/delay before exit
            tl.to(buttonWrapperRef.current, {
                opacity: 0,
                ease: 'power2.in',
                duration: 0.8,
            }, "<")
        })
    }, [])


    return (
        <div className='w-full flex items-center gap-[3.5vw] flex-col self-padd justify-center h-screen mt-[-100vh] sticky top-0'>
            <h2 ref={textRef} className='text34 w-[45vw] mt-[5vw] leading-[1.6]! text-center'>Explore 100+ scroll effects, cursor systems, text animations,
                page transitions,  WebGL scenes, navigation patterns, and
                creative UI components built for React, Next.js, Tailwind,
                GSAP, Motion, Three.js, and WebGL.</h2>
            <div ref={buttonWrapperRef} className='flex items-center justify-center gap-[2vw]'>
                <Button text="Install CLI" />
                <Button text="Work with Hyperiux" variant="white" />
            </div>

        </div>

    )
}
