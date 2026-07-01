'use client'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'
import SplitText from 'gsap/dist/SplitText'
import React, { useEffect, useRef } from 'react'

gsap.registerPlugin(ScrollTrigger, SplitText)

export default function SmallMotion() {
    const sectionRef = useRef()
    const textRef = useRef()
    const textRef2 = useRef()

    useEffect(() => {
        const smallSplit = SplitText.create(textRef.current, {
            type: 'chars',
        })
        const bigSplit = SplitText.create(textRef2.current, {
            type: 'chars',
        })

        gsap.set([textRef.current, textRef2.current], { perspective: 1000 })

        gsap.set(smallSplit.chars, { yPercent: 100, rotationX: -90, opacity: 0, transformOrigin: '50% 50% -50', filter: 'blur(10px)' })
        gsap.set(bigSplit.chars, { yPercent: 100, rotationX: -90, opacity: 0, transformOrigin: '50% 50% -50', filter: 'blur(10px)' })

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top 20%',
                end: 'bottom bottom',
                scrub: 1,
            },
        })

        tl.to(smallSplit.chars, {
            yPercent: 0,
            rotationX: 0,
            opacity: 1,
            filter: 'blur(0px)',
            stagger: 0.04,
            ease: 'power2.out',
            duration: 1,
        })
        .to(smallSplit.chars, {
            yPercent: -100,
            rotationX: 90,
            opacity: 0,
            filter: 'blur(10px)',
            stagger: 0.04,
            ease: 'power2.in',
            duration: 1,
        })
        .to(bigSplit.chars, {
            yPercent: 0,
            rotationX: 0,
            opacity: 1,
            filter: 'blur(0px)',
            stagger: 0.04,
            ease: 'power2.out',
            duration: 1,
        }, "<0.5")
        .to(bigSplit.chars, {
            yPercent: -100,
            rotationX: 90,
            opacity: 0,
            filter: 'blur(10px)',
            stagger: 0.04,
            ease: 'power2.in',
            duration: 1,
        })

        return () => {
            tl.kill()
            smallSplit.revert()
            bigSplit.revert()
        }
    }, [])

    return (
        <section ref={sectionRef} className='h-[300vh] w-full relative'>
            <div className='h-screen w-full sticky top-0 flex items-center justify-center overflow-hidden'>
                <h2 ref={textRef} className='text-[17vw] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center font-black'>Small Motion.</h2>
                <h2 ref={textRef2} className='text-[17vw] w-full text-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 leading-none text-primary font-black'>Big Signal.</h2>
            </div>
        </section>
    )
}
