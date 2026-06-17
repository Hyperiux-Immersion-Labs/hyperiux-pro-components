'use client'

import { useLayoutEffect, useRef } from 'react'
import Image from 'next/image'
import gsap from 'gsap'

const TECH_LOGOS = [
    { src: '/svgs/nextjs.svg', alt: 'Next.js', height: 37 },
    { src: '/svgs/reactjs.svg', alt: 'React', height: 68 },
    { src: '/svgs/gsaplogo.svg', alt: 'GSAP', height: 40 },
    { src: '/svgs/three.svg', alt: 'Three.js', height: 48 },
    { src: '/svgs/r3f.svg', alt: 'React Three Fiber', height: 41 },
    { src: '/svgs/glsl.svg', alt: 'GLSL', height: 43 },
    { src: '/svgs/motion.svg', alt: 'Motion', height: 37 },
]

const SPEED = 80

function MarqueeRow({ rowRef, hidden = false }) {
    return (
        <div
            ref={rowRef}
            aria-hidden={hidden}
            className="flex shrink-0 items-center"
        >
            {TECH_LOGOS.map((logo) => (
                <div
                    key={`${hidden ? 'clone' : 'base'}-${logo.alt}`}
                    className="flex items-center justify-center px-[4vw] max-md:px-[6vw]"
                >
                    <Image
                        src={logo.src}
                        alt={logo.alt}
                        width={240}
                        height={logo.height}
                        draggable={false}
                        id='marquee-svg'

                        className="h-full w-[8vw] max-md:w-[22vw] object-contain"
                    />
                </div>
            ))}
        </div>
    )
}

export default function TechMarquee() {
    const trackRef = useRef(null)
    const rowRef = useRef(null)

    useLayoutEffect(() => {
        const track = trackRef.current
        const row = rowRef.current

        if (!track || !row) return

        let tween

        const init = () => {
            tween?.kill()

            const width = row.offsetWidth
            if (!width) return

            gsap.set(track, { x: 0 })

            tween = gsap.to(track, {
                x: -width,
                duration: width / SPEED,
                ease: 'none',
                repeat: -1,
            })
        }

        init()

        const resizeObserver = new ResizeObserver(init)
        resizeObserver.observe(row)

        return () => {
            tween?.kill()
            resizeObserver.disconnect()
        }
    }, [])

    return (
        <section id='TechMarquee' className="relative pt-[10vw] max-md:pt-[25vw] w-full overflow-hidden">
            <div className="overflow-hidden">
                <div
                    ref={trackRef}
                    className="flex w-max items-center will-change-transform"
                >
                    <MarqueeRow rowRef={rowRef} />
                    <MarqueeRow hidden />
                </div>
            </div>

            {/* Left Blur */}
            <div id='LeftBlur' className="pointer-events-none absolute left-0 top-0 z-10 h-full w-[10vw] max-md:w-[20vw] bg-linear-to-r from-background via-background/70 to-transparent" />

            {/* Right Blur */}
            <div id='RightBlur' className="pointer-events-none absolute right-0 top-0 z-10 h-full w-[10vw] max-md:w-[20vw] max-ms:-right-4 bg-linear-to-l from-background via-background/70 to-transparent" />
        </section>
    )
}