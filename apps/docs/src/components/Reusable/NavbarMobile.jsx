'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLenis } from 'lenis/react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { ChevronDown, Menu, X } from 'lucide-react'
import gsap from 'gsap'

import { HyperiuxLogo } from '@/utils/Icons'
import Button from '@/components/Reusable/Button'
import { navCategoryColumns, navDocsItems, vaultLinks } from '@/utils/Links'

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

const categoryLinks = navCategoryColumns.flat()

const DROPDOWN_DATA = {
    categories: categoryLinks,
    docs: navDocsItems,
}

function MobileDropdownItem({ label, href, icon, onClose }) {
    const pathname = usePathname()
    const isActive = href !== '#' && pathname.startsWith(href)

    return (
        <Link
            href={href}
            onClick={onClose}
            className={`flex items-center gap-3 rounded-xl px-3 py-3 transition-colors duration-200 ${
                isActive ? 'bg-primary/10 text-primary' : 'text-white/70 hover:bg-white/5 hover:text-white'
            }`}
        >
            {icon && (
                <span className="flex size-5 shrink-0 items-center justify-center">
                    <Image src={icon} alt="" width={28} height={28} className="size-full object-contain" />
                </span>
            )}
            <span className="text-[4vw] font-medium">{label}</span>
        </Link>
    )
}

function MobileDropdown({ label, items, isOpen, onToggle, onClose }) {
    const contentRef = useRef(null)
    const wrapperRef = useRef(null)

    useIsomorphicLayoutEffect(() => {
        if (!contentRef.current || !wrapperRef.current) return

        gsap.killTweensOf(wrapperRef.current)

        if (isOpen) {
            const height = contentRef.current.scrollHeight
            gsap.to(wrapperRef.current, {
                height,
                opacity: 1,
                duration: 0.35,
                ease: 'power2.out',
            })
        } else {
            gsap.to(wrapperRef.current, {
                height: 0,
                opacity: 0,
                duration: 0.25,
                ease: 'power2.inOut',
            })
        }
    }, [isOpen])

    return (
        <div className="border-b border-white/5">
            <button
                type="button"
                onClick={onToggle}
                className="flex w-full items-center justify-between py-5 text-left"
            >
                <span className="text-[5vw] font-medium text-white/90">{label}</span>
                <ChevronDown
                    className={`size-5 text-white/50 transition-transform duration-300 ${
                        isOpen ? 'rotate-180 text-primary' : ''
                    }`}
                />
            </button>

            <div ref={wrapperRef} className="h-0 overflow-hidden opacity-0">
                <div ref={contentRef} className="flex flex-col gap-1 pb-4">
                    {items.map((item) => (
                        <MobileDropdownItem key={item.label} {...item} onClose={onClose} />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default function NavbarMobile() {
    const navbarRef = useRef(null)
    const menuRef = useRef(null)
    const linksRef = useRef(null)
    const hidden = useRef(false)
    const pathname = usePathname()
    // const lenis = useLenis() // No longer needed for stop/start

    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [openDropdown, setOpenDropdown] = useState(null)

    const closeMenu = () => {
        setIsMenuOpen(false)
        setOpenDropdown(null)
    }

    const toggleDropdown = (id) => {
        setOpenDropdown((current) => (current === id ? null : id))
    }

    const toggleNavbar = (hide) => {
        if (!navbarRef.current || hidden.current === hide) return
        hidden.current = hide

        gsap.killTweensOf(navbarRef.current)
        gsap.to(navbarRef.current, {
            yPercent: hide ? -100 : 0,
            duration: 0.4,
            ease: 'power2.out',
        })
    }

    useLenis(({ scroll, velocity }) => {
        if (isMenuOpen) return
        if (scroll < 80) return toggleNavbar(false)
        if (velocity > 0.1) toggleNavbar(true)
        else if (velocity < -0.15) toggleNavbar(false)
    })

    // Replace lenis.stop/start with body scroll lock for overlay
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = "hidden"
            toggleNavbar(false)
        } else {
            document.body.style.overflow = ""
        }
        return () => {
            document.body.style.overflow = ""
        }
    }, [isMenuOpen])

    useEffect(() => {
        const handlePopState = () => {
            setIsMenuOpen(false)
            setOpenDropdown(null)
        }

        window.addEventListener('popstate', handlePopState)
        return () => window.removeEventListener('popstate', handlePopState)
    }, [])

    useIsomorphicLayoutEffect(() => {
        if (!menuRef.current || !linksRef.current) return

        gsap.killTweensOf([menuRef.current, linksRef.current])

        if (isMenuOpen) {
            gsap.set(menuRef.current, { display: 'flex', pointerEvents: 'auto' })
            gsap.fromTo(
                menuRef.current,
                { opacity: 0 },
                { opacity: 1, duration: 0.3, ease: 'power2.out' }
            )

            const items = linksRef.current.children
            gsap.fromTo(
                items,
                { y: 30, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.4,
                    ease: 'power2.out',
                    stagger: 0.06,
                    delay: 0.1,
                }
            )
        } else {
            gsap.to(menuRef.current, {
                opacity: 0,
                duration: 0.25,
                ease: 'power2.inOut',
                onComplete: () => {
                    if (menuRef.current) {
                        gsap.set(menuRef.current, { display: 'none', pointerEvents: 'none' })
                    }
                },
            })
        }
    }, [isMenuOpen])

    useEffect(() => {
        const navbar = navbarRef.current
        const menu = menuRef.current
        const links = linksRef.current

        return () => {
            gsap.killTweensOf([navbar, menu, links])
        }
    }, [])

    return (
        <>
            {/* Navbar Bar */}
            <nav
                ref={navbarRef}
                className="fixed top-0 left-0 z-1000 hidden w-full items-center justify-between border-b border-white/5 bg-black/90 px-6 py-4 backdrop-blur-xl max-md:flex"
            >
                <Link href="/" onClick={closeMenu}>
                    <HyperiuxLogo className="h-auto w-[120px] text-primary" />
                </Link>

                <button
                    type="button"
                    onClick={() => setIsMenuOpen((open) => !open)}
                    className="relative flex size-10 items-center justify-center rounded-full bg-white/5 text-white transition-colors hover:bg-white/10"
                    aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={isMenuOpen}
                >
                    {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                </button>
            </nav>

            {/* Full Screen Menu Overlay */}
            <div
                ref={menuRef}
                className="fixed inset-0 z-999 hidden max-md:flex bg-black opacity-0 pointer-events-none"
            >
                <div
                    data-lenis-prevent
                    className="absolute inset-0 overflow-y-auto px-[8vw] pt-24 pb-8"
                >
                    <div ref={linksRef} className="flex flex-1 flex-col">
                        {vaultLinks.map(({ label, href, dropdown }) => {
                            if (dropdown) {
                                return (
                                    <MobileDropdown
                                        key={label}
                                        label={label}
                                        items={DROPDOWN_DATA[dropdown]}
                                        isOpen={openDropdown === dropdown}
                                        onToggle={() => toggleDropdown(dropdown)}
                                        onClose={closeMenu}
                                    />
                                )
                            }

                            const isExternal = href.startsWith('http')
                            const isActive = href !== '#' && pathname.startsWith(href)

                            return (
                                <Link
                                    key={label}
                                    href={href}
                                    target={isExternal ? '_blank' : undefined}
                                    rel={isExternal ? 'noopener noreferrer' : undefined}
                                    onClick={closeMenu}
                                    className={`border-b border-white/5 py-5 text-[5vw] font-medium transition-colors duration-200 ${
                                        isActive ? 'text-primary' : 'text-white/90 hover:text-white'
                                    }`}
                                >
                                    {label}
                                </Link>
                            )
                        })}
                    </div>

                    <div className="mt-8 border-t border-white/10 pt-8">
                        <div className="flex w-full justify-center" onClick={closeMenu}>
                            <Button text="Install CLI" href="/effects" />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
