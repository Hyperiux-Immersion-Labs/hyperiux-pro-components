'use client'

import { useRef, useState } from 'react'
import { useLenis } from 'lenis/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import gsap from 'gsap'

import { GithubIcon, HyperiuxLogo } from '@/utils/Icons'
import Button from '@/components/Reusable/Button'
import { vaultLinks } from '@/utils/Links'

export default function Navbar() {
    const navbarRef = useRef(null)
    const hidden = useRef(false)
    const [hoveredIndex, setHoveredIndex] = useState(null)
    const pathname = usePathname()

    const activeIndex = vaultLinks.findIndex((link) => {
        if (link.href === '/') {
            return pathname === '/'
        }
        return pathname.startsWith(link.href)
    })

    const toggleNavbar = (hide) => {
        if (!navbarRef.current || hidden.current === hide) return

        hidden.current = hide

        gsap.killTweensOf(navbarRef.current)
        gsap.to(navbarRef.current, {
            yPercent: hide ? -100 : 0,
            duration: 0.45,
            ease: 'power2.out',
        })
    }

    useLenis(({ scroll, velocity }) => {
        if (scroll < 100) return toggleNavbar(false)
        if (velocity > 0.1) toggleNavbar(true)
        else if (velocity < -0.2) toggleNavbar(false)
    })

    return (
        <nav
            ref={navbarRef}
            className="fixed top-0 left-0 z-999 flex w-full items-center justify-between px-[3.5vw] py-[2vw]"
        >
            <Link href="/">
                <HyperiuxLogo className="w-[10vw] h-auto text-primary" />
            </Link>

            <div
                className="bg-grey text20 flex gap-[0.6vw] rounded-full p-[0.6vw] font-medium relative"
                onMouseLeave={() => setHoveredIndex(null)}
            >
                {vaultLinks.map(({ label, href }, index) => {
                    const isHighlighted = hoveredIndex !== null ? hoveredIndex === index : activeIndex === index
                    return (
                        <Link
                            className={`relative rounded-full px-[1.2vw] p-[0.4vw] transition-colors duration-300 z-10 ${isHighlighted ? 'text-foreground' : 'text-white/70'
                                }`}
                            key={label}
                            href={href}
                            onMouseEnter={() => setHoveredIndex(index)}
                        >
                            {label}
                            {isHighlighted && (
                                <motion.span
                                    layoutId="nav-pill"
                                    className="absolute inset-0 bg-primary rounded-full -z-10"
                                    transition={{ type: 'spring', stiffness: 180, damping: 20 }}
                                />
                            )}
                        </Link>
                    )
                })}
            </div>

            <div className="flex items-center justify-center gap-[2.5vw]">
                <Button text="Install CLI" href="/effects" />

                <Link
                    href="https://github.com/hyperiux"
                    target="_blank"
                    className="size-[2.5vw] transition-transform duration-300 hover:scale-105"
                >
                    <GithubIcon className="size-full text-primary" />
                </Link>
            </div>
        </nav>
    )
}