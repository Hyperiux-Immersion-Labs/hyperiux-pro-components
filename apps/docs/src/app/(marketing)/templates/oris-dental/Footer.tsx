'use client'

import React, { useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import DotsCanvas from './effects/teeth-3d/DotsCanvas'
import SplitTextLines from './effects/split-text-lines/SplitTextLines'
import OrisDentalLogo from './assets/OrisDental.svg'

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger)
}

type FooterColumn = {
    title: string
    links: { label: string; href: string }[]
}

const LEFT_COLUMNS: FooterColumn[] = [
    {
        title: 'Our Treatments',
        links: [
            { label: 'Teeth Whitening', href: '#' },
            { label: 'Calm My Mind', href: '#' },
            { label: 'Dental Implants', href: '#' },
            { label: 'Braces & Aligners', href: '#' },
        ],
    },
    {
        title: 'About Us',
        links: [
            { label: 'Our Team', href: '#' },
            { label: 'Technology', href: '#' },
            { label: 'Patient Stories', href: '#' },
            { label: 'Careers', href: '#' },
        ],
    },
]

const RIGHT_COLUMNS: FooterColumn[] = [
    {
        title: 'Support',
        links: [
            { label: 'Book Appointment', href: '#' },
            { label: 'FAQ', href: '#' },
            { label: 'Insurance Info', href: '#' },
            { label: 'Contact', href: '#' },
        ],
    },
    {
        title: 'Follow Us',
        links: [
            { label: 'Instagram', href: '#' },
            { label: 'Facebook', href: '#' },
            { label: 'TikTok', href: '#' },
        ],
    },
]

function FooterLinkColumn({ column }: { column: FooterColumn }) {
    return (
        <div className="footer-col flex flex-col gap-3">
            <p className="text-[#C0C0C0] oris-text22 font-normal whitespace-nowrap">
                {column.title}
            </p>
            <ul className="flex flex-col gap-2.5">
                {column.links.map((link) => (
                    <li key={link.label}>
                        <Link
                            href={link.href}
                            className="text-white/90 hover:text-white whitespace-nowrap no-underline transition-colors duration-300"
                        >
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default function Footer() {
    const containerRef = useRef<HTMLDivElement>(null)
    const footerRef = useRef<HTMLElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)
    const wordmarkRef = useRef<HTMLDivElement>(null)
    const navRef = useRef<HTMLElement>(null)

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const ctx = gsap.context(() => {
            // Parallax glide for top header & tagline
            if (contentRef.current) {
                gsap.fromTo(
                    contentRef.current,
                    { y: -60, opacity: 0.8 },
                    {
                        y: 0,
                        opacity: 1,
                        ease: 'none',
                        scrollTrigger: {
                            trigger: container,
                            start: 'top bottom',
                            end: 'bottom bottom',
                            scrub: 1,
                        },
                    }
                )
            }

            // Staggered upward parallax for the link columns
            if (navRef.current) {
                const cols = navRef.current.querySelectorAll('.footer-col')
                gsap.fromTo(
                    cols,
                    { y: 40, opacity: 0.65 },
                    {
                        y: 0,
                        opacity: 1,
                        stagger: 0.04,
                        ease: 'none',
                        scrollTrigger: {
                            trigger: container,
                            start: 'top bottom',
                            end: 'bottom bottom',
                            scrub: 1,
                        },
                    }
                )
            }

            // Rise and scale animation for bottom wordmark
            if (wordmarkRef.current) {
                gsap.fromTo(
                    wordmarkRef.current,
                    { yPercent: 40, scale: 0.85 },
                    {
                        yPercent: 0,
                        scale: 1.02,
                        ease: 'none',
                        scrollTrigger: {
                            trigger: container,
                            start: 'top bottom',
                            end: 'bottom bottom',
                            scrub: 1,
                        },
                    }
                )
            }
        }, containerRef)

        return () => ctx.revert()
    }, [])

    return (
        <div
            ref={containerRef}
            className="relative h-screen w-full max-md:h-auto max-md:min-h-screen"
            style={{ clipPath: 'inset(0 0 0 0)' }}
        >
            <footer
                ref={footerRef}
                id="oris-footer"
                className="fixed bottom-0 left-0 w-full h-screen bg-linear-to-b from-[#3365e2] via-[#234fc7] to-[#0f2b82] text-white overflow-hidden oris-paddx pt-[4vw] flex flex-col justify-between max-md:relative max-md:h-auto max-md:min-h-screen"
            >
                {/* Interactive Background Dots */}
                <DotsCanvas
                    spacing={22}
                    lerpFactor={0.15}
                    baseRadius={1.4}
                    maxRadius={3.8}
                    interactionRadius={200}
                />

                {/* Top Branding & Main Tagline */}
                <div ref={contentRef} className="relative z-10 flex flex-col items-start max-w-2xl">
                    <SplitTextLines as="h2" className="oris-text64 font-bold! leading-[1.1] text-white max-w-[35vw] max-md:max-w-full">
                        OrisDental Brighten your smile with expert care.
                    </SplitTextLines>
                </div>

                {/* Links Navigation: left pair anchored left, right pair anchored right */}
                <nav
                    ref={navRef}
                    aria-label="Footer"
                    className="relative z-10 flex w-full items-start justify-between mt-[4vw] mb-[3vw] max-md:flex-col max-md:gap-10 max-md:mt-12 max-md:mb-10"
                >
                    <div className="flex gap-[8vw] max-md:gap-12 max-sm:gap-8">
                        {LEFT_COLUMNS.map((column) => (
                            <FooterLinkColumn key={column.title} column={column} />
                        ))}
                    </div>
                    <div className="flex gap-[5vw] max-md:gap-12 max-sm:gap-8">
                        {RIGHT_COLUMNS.map((column) => (
                            <FooterLinkColumn key={column.title} column={column} />
                        ))}
                    </div>
                </nav>

                {/* Huge Baseline Wordmark */}
                <div ref={wordmarkRef} className="relative z-10 w-full flex justify-center items-end select-none pointer-events-none mt-auto">
                    <Image
                        src={OrisDentalLogo}
                        alt="OrisDental"
                        width={1872}
                        height={334}
                        className="w-full scale-102 h-auto object-contain select-none pointer-events-none"
                        priority
                    />
                </div>
            </footer>
        </div>
    )
}
