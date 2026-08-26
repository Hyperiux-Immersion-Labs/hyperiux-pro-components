'use client'

import Image, { StaticImageData } from 'next/image'
import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/dist/ScrollTrigger'
import SplitTextLines from './effects/split-text-lines/SplitTextLines'
import hc1 from './assets/hc1.png'
import hc2 from './assets/hc2.png'
import hc3 from './assets/hc3.png'
import hc4 from './assets/hc4.png'

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger)
}

interface GalleryImage {
    id: number
    src: StaticImageData | string
    alt: string
}

const GALLERY_IMAGES: GalleryImage[] = [
    { id: 1, src: hc1, alt: 'Dental consultation' },
    { id: 2, src: hc2, alt: 'Doctor reviewing treatment' },
    { id: 3, src: hc3, alt: 'Pediatric care' },
    { id: 4, src: hc4, alt: 'Patient care session' },
]

export default function PassionMeetPurpose() {
    const sectionRef = useRef<HTMLElement | null>(null)
    const gridRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        if (typeof window === 'undefined') return

        const ctx = gsap.context(() => {
            if (!gridRef.current) return

            const cards = gridRef.current.querySelectorAll('.gallery-card')

            gsap.set(cards, {
                y: 85,
                opacity: 0,
            })

            gsap.to(cards, {
                y: 0,
                opacity: 1,
                duration: 1.4,
                stagger:0.05,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: gridRef.current,
                    start: 'top 82%',
                    once: true,
                },
            })
        }, sectionRef)

        return () => ctx.revert()
    }, [])

    return (
        <section
            id="passion-meet-purpose"
            ref={sectionRef}
            className="w-full bg-white oris-paddx mt-[-10vw] max-[1025px]:py-18 relative z-10 py-[7vw] flex flex-col items-center max-[1025px]:gap-[5vw] max-md:gap-[8vw] justify-center text-oris-secondary"
        >
            {/* Header */}
            <div className="flex flex-col items-center text-center mx-auto">
                <SplitTextLines as="h2" className="text-[4.2vw] max-[1025px]:text-[6vw] max-md:text-[7.5vw] font-normal leading-[1.15]">
                    Passion Meet Purpose
                </SplitTextLines>
                <SplitTextLines as="p" className="oris-text22 text-oris-secondary/80 mt-[1.5vw] max-w-[36vw] max-[1025px]:max-w-[80vw]! max-md:max-w-full" delay={0.15}>
                    Behind every treatment is a team united by one goal: creating better experiences for every patient.
                </SplitTextLines>
            </div>

            {/* 4 Cards Row with Staggered Scroll Entrance */}
            <div
                ref={gridRef}
                className="grid grid-cols-4 gap-[5vw] w-full mt-[5vw]  max-[1025px]:grid-cols-2 max-[1025px]:gap-2"
            >
                {GALLERY_IMAGES.map((item) => (
                    <div
                        key={item.id}
                        className="gallery-card w-full aspect-[3/4.2] relative rounded-[1vw] max-md:rounded-xl overflow-hidden  will-change-transform"
                    >
                        <Image
                            src={item.src}
                            alt={item.alt}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            className="object-cover hover:scale-115 transition-all duration-500 "
                        />
                    </div>
                ))}
            </div>
        </section>
    )
}
