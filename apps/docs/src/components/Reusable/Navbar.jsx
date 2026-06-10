'use client'

import { useRef } from 'react'
import { useLenis } from 'lenis/react'
import Link from 'next/link'
import gsap from 'gsap'

import { GithubIcon, HyperiuxLogo } from '@/utils/Icons'
import Button from '@/components/Reusable/Button'
import { vaultLinks } from '@/utils/Links'

export default function Navbar() {
    const navbarRef = useRef(null)
    const hidden = useRef(false)

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

            <div className="bg-grey text20 flex gap-[3vw] rounded-full px-[2.5vw] py-2 font-medium">
                {vaultLinks.map(({ label }) => (
                    <Link className='hover:text-primary transition-colors duration-300' key={label} href="#">
                        {label}
                    </Link>
                ))}
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