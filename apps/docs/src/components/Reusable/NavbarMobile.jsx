'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import gsap from 'gsap'

import { GithubIcon, HyperiuxLogo } from '@/utils/Icons'
import Button from '@/components/Reusable/Button'
import { vaultLinks } from '@/utils/Links'

export default function NavbarMobile() {
    const navbarRef = useRef(null)
    const hidden = useRef(false)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const pathname = usePathname()

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

    useEffect(() => {
        let lastScrollY = typeof window !== 'undefined' ? window.scrollY : 0

        const handleScroll = () => {
            if (isMenuOpen) return
            const currentScrollY = window.scrollY

            // Micro-scroll threshold (hysteresis) to prevent flickering on touch screens
            const diff = currentScrollY - lastScrollY
            if (currentScrollY < 50) {
                toggleNavbar(false)
            } else if (diff > 5) {
                // Scrolling down
                toggleNavbar(true)
            } else if (diff < -10) {
                // Scrolling up
                toggleNavbar(false)
            }

            lastScrollY = currentScrollY
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [isMenuOpen])

    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden'
            // Ensure the navbar is fully visible when the menu is open
            toggleNavbar(false)
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isMenuOpen])

    return (
        <nav
            ref={navbarRef}
            className="fixed sm:hidden top-0 left-0 z-999 w-full  backdrop-blur-md px-6 py-5 flex items-center justify-between border-b border-white/5"
        >
            <Link href="/">
                <HyperiuxLogo className="w-[125px] h-auto text-primary" />
            </Link>

            <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white focus:outline-none p-2 relative z-1000 transition-transform duration-200 active:scale-95"
                aria-label="Toggle Menu"
            >
                {isMenuOpen ? (
                    <X size={26} className="text-white" />
                ) : (
                    <Menu size={26} className="text-white" />
                )}
            </button>

            {/* Mobile Menu Drawer */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                        className="fixed inset-0 top-0 left-0 w-screen h-screen bg-black z-998 flex flex-col justify-center items-center gap-8 px-8"
                    >
                        <div className="flex flex-col items-center gap-6 mt-[12vh]">
                            {vaultLinks.map(({ label, href }) => (
                                <Link
                                    key={label}
                                    href={href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`text22 font-medium tracking-wider transition-colors duration-300 ${pathname === href ? 'text-primary' : 'text-white/80 hover:text-white'
                                        }`}
                                >
                                    {label}
                                </Link>
                            ))}
                        </div>

                        <div className="w-2/3 h-[1px] bg-white/10 my-6" />

                        <div className="flex flex-col items-center gap-6 w-full">
                            <Button text="Install CLI" href="/effects" onClick={() => setIsMenuOpen(false)} />

                            <Link
                                href="https://github.com/hyperiux"
                                target="_blank"
                                onClick={() => setIsMenuOpen(false)}
                                className="size-11 transition-transform duration-300 hover:scale-105 mt-2"
                            >
                                <GithubIcon className="size-full text-primary" />
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    )
}
