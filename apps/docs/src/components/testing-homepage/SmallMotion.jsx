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
        const section = sectionRef.current
        if (!section) return

        // Reduced motion: both headings are absolutely stacked and only
        // readable because the scrub shows one at a time. Show the first
        // statically and hide the second; skip the split and animation.
        if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) {
            if (textRef2.current) textRef2.current.style.visibility = 'hidden'
            return
        }

        let smallSplit, bigSplit, tl

        // ponytail: defer the SplitText calls until this below-fold section
        // nears the viewport instead of splitting on page mount.
        const mount = () => {
        smallSplit = SplitText.create(textRef.current, {
            type: 'chars',
            aria: 'none',
        })
        bigSplit = SplitText.create(textRef2.current, {
            type: 'chars',
            aria: 'none',
        })

        gsap.set([textRef.current, textRef2.current], { perspective: 1000 })

        gsap.set(smallSplit.chars, { yPercent: 100, rotationX: -90, opacity: 0, transformOrigin: '50% 50% -50', filter: 'blur(10px)' })
        gsap.set(bigSplit.chars, { yPercent: 100, rotationX: -90, opacity: 0, transformOrigin: '50% 50% -50', filter: 'blur(10px)' })

        tl = gsap.timeline({
            scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top 20%',
                end: 'bottom bottom',
                scrub: true,
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
        io.observe(section)

        return () => {
            io.disconnect()
            tl?.kill()
            smallSplit?.revert()
            bigSplit?.revert()
        }
    }, [])

    return (
        <section ref={sectionRef} className='h-[240vh] max-md:h-[200vh] max-sm:h-[200vh] w-full relative'>
            <div className='h-screen w-full max-sm:w-[85vw] max-md:w-[85vw] max-md:mx-auto sticky top-0 flex items-center justify-center overflow-hidden'>
                <h2 ref={textRef} className='text-[16vw] max-md:text-[12vw] max-sm:text-[14vw] max-sm:font-medium! absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center font-black'>Small Motion.</h2>
                <h2 ref={textRef2} className='text-[17vw] w-full text-center absolute max-sm:text-[14vw] max-md:text-[12vw] max-sm:font-medium! left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 leading-none text-primary font-black'>Big Signal.</h2>
            </div>
        </section>
    )
}
