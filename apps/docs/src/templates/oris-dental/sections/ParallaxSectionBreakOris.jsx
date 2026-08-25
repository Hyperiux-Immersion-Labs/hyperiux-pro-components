'use client'

import Image from 'next/image'
import { useLenis } from 'lenis/react'
import { useRef } from 'react'
import OrisTextFill from '../components/OrisTextFill'

const STATEMENT_TEXT =
    "At Oris Dental, our comprehensive dentist services are designed to keep your smile healthy and confident from preventive care that catches issues early to restorative treatments that bring back your natural comfort, we're here to help you enjoy lasting oral health."

export default function ParallaxSectionBreakOris() {
    const sectionRef = useRef(null)
    const imageRef = useRef(null)

    useLenis(() => {
        if (!sectionRef.current || !imageRef.current) return
        const rect = sectionRef.current.getBoundingClientRect()
        const vh = window.innerHeight

        if (rect.bottom >= 0 && rect.top <= vh) {
            const progress = (vh - rect.top) / (vh + rect.height)
            const yOffset = (progress - 0.5) * 100
            imageRef.current.style.transform = `translate3d(0, ${yOffset}px, 0) scale(1.15)`
        }
    })

    return (
        <section
            id="parallax"
            ref={sectionRef}
            className="h-screen w-full flex items-center justify-center relative overflow-hidden"
        >
            <div
                ref={imageRef}
                className="absolute inset-0 w-full h-full will-change-transform"
            >
                <Image
                    src="/templates/oris-detal/imgs/parallax.png"
                    alt="Oris Dental clinic interior"
                    fill
                    sizes="100vw"
                    className="object-cover"
                />
            </div>

            <OrisTextFill
                as="h2"
                text={STATEMENT_TEXT}
                className="oris-text48 relative text-center w-[90vw] z-10 font-medium!"
                primaryColor="#3365e2"
                textColor="#ffffff"
                dimColor="#13314a"
            />
        </section>
    )
}


