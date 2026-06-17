'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLenis } from 'lenis/react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import gsap from 'gsap'

import { GithubIcon, HyperiuxLogo } from '@/utils/Icons'
import Button from '@/components/Reusable/Button'
import { navCategoryColumns, navDocsItems, vaultLinks } from '@/utils/Links'

const MENU_ANIM = {
    duration: 0.26,
    ease: 'power2.out',
    distance: 48,
    fade: true,
    heightDuration: 0.22,
    heightEase: 'power2.out',
    fadeDuration: 0.18,
    widthDuration: 0.32,
    widthEase: 'power2.out',
}

const useIsomorphicLayoutEffect =
    typeof window !== 'undefined' ? useLayoutEffect : useEffect

function getPaneHeight(element) {
    if (!element) return 0
    return element.offsetHeight || element.scrollHeight || 0
}

function NavDropdownItem({ label, href, icon }) {
    return (
        <Link
            href={href}
            className="group flex items-center gap-[0.75vw] rounded-[0.55vw] px-[0.7vw] py-[0.5vw] transition-colors duration-300 hover:bg-black"
        >
            <span className="relative flex size-[1.35vw] shrink-0 items-center justify-center">
                <Image src={icon} alt="" width={35} height={35} aria-hidden className="size-full object-contain" />
            </span>
            <span className="text-[0.95vw] font-medium whitespace-nowrap text-white/75 transition-colors duration-300 group-hover:text-white">
                {label}
            </span>
        </Link>
    )
}

function CategoriesPanel() {
    return (
        <div className="grid grid-cols-2 gap-x-[1.6vw] gap-y-[0.15vw]">
            {navCategoryColumns.map((column, columnIndex) => (
                <div key={columnIndex} className="flex flex-col">
                    {column.map((item) => (
                        <NavDropdownItem key={item.label} {...item} />
                    ))}
                </div>
            ))}
        </div>
    )
}

function DocsPanel() {
    return (
        <div className="flex flex-col gap-[0.15vw]">
            {navDocsItems.map((item) => (
                <NavDropdownItem key={item.label} {...item} />
            ))}
        </div>
    )
}

const PANELS = {
    categories: { width: '32vw', Panel: CategoriesPanel, index: 0 },
    docs: { width: '18vw', Panel: DocsPanel, index: 1 },
}

function NavDropdown({ panel }) {
    const shellRef = useRef(null)
    const viewportRef = useRef(null)
    const currentPaneRef = useRef(null)
    const nextPaneRef = useRef(null)
    const tlRef = useRef(null)

    const [currentPanel, setCurrentPanel] = useState(null)
    const [nextPanel, setNextPanel] = useState(null)

    const animRef = useRef({
        isOpen: false,
        hasOpenedOnce: false,
        isAnimating: false,
        direction: 1,
        queued: null,
        current: null,
        pending: null,
    })

    const killTweens = () => {
        tlRef.current?.kill()
        tlRef.current = null
        gsap.killTweensOf([shellRef.current, viewportRef.current, currentPaneRef.current, nextPaneRef.current])
    }

    const reset = () => {
        animRef.current = {
            isOpen: false,
            hasOpenedOnce: false,
            isAnimating: false,
            direction: 1,
            queued: null,
            current: null,
            pending: null,
        }
        setCurrentPanel(null)
        setNextPanel(null)
    }

    const closeMenu = () => {
        const anim = animRef.current
        if (!anim.isOpen) return

        anim.isOpen = false
        anim.current = null
        anim.pending = null

        if (!shellRef.current) {
            reset()
            return
        }

        killTweens()
        gsap.to(shellRef.current, {
            opacity: 0,
            duration: MENU_ANIM.fadeDuration,
            ease: 'power2.out',
            onComplete: () => {
                if (animRef.current.isOpen) return
                reset()
            },
        })
    }

    const openAt = (target) => {
        killTweens()

        const wasOpen = animRef.current.isOpen
        animRef.current.isOpen = true
        animRef.current.current = target
        animRef.current.pending = null
        animRef.current.isAnimating = false
        animRef.current.queued = null
        animRef.current.direction = 1

        if (!wasOpen) animRef.current.hasOpenedOnce = false

        setCurrentPanel(target)
        setNextPanel(null)
    }

    const requestSwitch = (target) => {
        const anim = animRef.current

        if (!target) {
            closeMenu()
            return
        }

        if (!anim.isOpen || anim.current === null) {
            openAt(target)
            return
        }

        if (target === anim.current && anim.pending === null) return
        if (target === anim.pending) return

        const base = anim.queued ?? anim.pending ?? anim.current
        const dir = PANELS[target].index > PANELS[base].index ? 1 : -1

        if (anim.isAnimating) {
            anim.queued = target
            anim.direction = dir
            return
        }

        anim.direction = dir
        anim.pending = target
        setNextPanel(target)
    }

    useIsomorphicLayoutEffect(() => {
        requestSwitch(panel)
    }, [panel])

    useIsomorphicLayoutEffect(() => {
        if (!animRef.current.isOpen || !currentPanel || !viewportRef.current || !currentPaneRef.current) return

        killTweens()

        const contentHeight = getPaneHeight(currentPaneRef.current)
        const anim = animRef.current

        if (shellRef.current) {
            gsap.set(shellRef.current, { width: PANELS[currentPanel].width })
        }

        if (!anim.hasOpenedOnce) {
            gsap.set(viewportRef.current, { height: contentHeight })
            gsap.set(shellRef.current, { opacity: 0 })

            gsap.to(shellRef.current, {
                opacity: 1,
                duration: MENU_ANIM.fadeDuration,
                ease: 'power2.out',
                onComplete: () => {
                    animRef.current.hasOpenedOnce = true
                },
            })
            return
        }

        gsap.set(viewportRef.current, { height: contentHeight })
    }, [currentPanel])

    useIsomorphicLayoutEffect(() => {
        if (!currentPanel || !currentPaneRef.current || !viewportRef.current || nextPanel !== null) return
        gsap.set(viewportRef.current, { height: getPaneHeight(currentPaneRef.current) })
    }, [currentPanel, nextPanel])

    useIsomorphicLayoutEffect(() => {
        if (nextPanel === null || !currentPaneRef.current || !nextPaneRef.current || !viewportRef.current) return

        const currentEl = currentPaneRef.current
        const nextEl = nextPaneRef.current
        const targetPanel = nextPanel
        const dir = animRef.current.direction
        const { distance, duration, ease, fade, heightDuration, heightEase, widthDuration, widthEase } = MENU_ANIM

        animRef.current.isAnimating = true
        killTweens()

        gsap.set(currentEl, {
            position: 'absolute',
            inset: 0,
            x: 0,
            opacity: 1,
            zIndex: 1,
            pointerEvents: 'none',
        })

        gsap.set(nextEl, {
            position: 'absolute',
            inset: 0,
            x: dir > 0 ? distance : -distance,
            opacity: fade ? 0 : 1,
            zIndex: 2,
            pointerEvents: 'auto',
        })

        gsap.set(viewportRef.current, { height: getPaneHeight(currentEl) })

        tlRef.current = gsap.timeline({
            onComplete: () => {
                animRef.current.isOpen = true
                animRef.current.current = targetPanel
                animRef.current.pending = null
                animRef.current.isAnimating = false
                setCurrentPanel(targetPanel)
                setNextPanel(null)

                const queued = animRef.current.queued
                animRef.current.queued = null

                if (queued && queued !== targetPanel) requestSwitch(queued)
            },
        })

        tlRef.current
            .to(viewportRef.current, { height: getPaneHeight(nextEl), duration: heightDuration, ease: heightEase }, 0)
            .to(shellRef.current, { width: PANELS[targetPanel].width, duration: widthDuration, ease: widthEase }, 0)
            .to(currentEl, { x: dir > 0 ? -distance : distance, opacity: fade ? 0 : 1, duration, ease }, 0)
            .to(nextEl, { x: 0, opacity: 1, duration, ease }, 0)
    }, [nextPanel])

    useEffect(() => () => killTweens(), [])

    if (!currentPanel) return null

    const Panel = currentPanel ? PANELS[currentPanel].Panel : null
    const NextPanel = nextPanel ? PANELS[nextPanel].Panel : null

    return (
        <div className="absolute top-full left-1/2 z-50 w-max -translate-x-1/2 pt-[0.75vw]">
            <div
                ref={shellRef}
                className="overflow-hidden rounded-[1.1vw] border border-white/8 bg-grey p-[1.1vw] shadow-[0_1.2vw_3.5vw_rgba(0,0,0,0.55)]"
                style={{ width: currentPanel ? PANELS[currentPanel].width : PANELS.categories.width }}
            >
                <div ref={viewportRef} className="relative">
                    {Panel && (
                        <div key={`current-${currentPanel}`} ref={currentPaneRef} className="relative w-full">
                            <Panel />
                        </div>
                    )}

                    {NextPanel && (
                        <div key={`next-${nextPanel}`} ref={nextPaneRef} className="absolute left-0 top-0 w-full">
                            <NextPanel />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function Navbar() {
    const navbarRef = useRef(null)
    const hidden = useRef(false)
    const [activeItem, setActiveItem] = useState(null)
    const pathname = usePathname()

    const activeIndex = vaultLinks.findIndex((link) => {
        if (link.href === '/') return pathname === '/'
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

    const handleNavEnter = useCallback((index, dropdown) => {
        setActiveItem({ index, dropdown: dropdown ?? null })
    }, [])

    const handleNavLeave = useCallback(() => {
        setActiveItem(null)
    }, [])

    const isHighlighted = (index, dropdown) => {
        if (activeItem?.dropdown && dropdown) return activeItem.dropdown === dropdown
        if (activeItem) return activeItem.index === index
        return activeIndex === index
    }

    return (
        <nav
            ref={navbarRef}
            className="fixed top-0 left-0 z-999 flex w-full items-center justify-between overflow-visible px-[3.5vw] py-[2vw] backdrop-blur-sm max-md:hidden"
        >
            <Link href="/">
                <HyperiuxLogo className="h-auto w-[10vw] text-primary" />
            </Link>

            <div className="relative" onMouseLeave={handleNavLeave}>
                <div className="relative flex gap-[0.6vw] rounded-full bg-grey p-[0.6vw] text20 font-medium">
                    {vaultLinks.map(({ label, href, dropdown }, index) => {
                        const highlighted = isHighlighted(index, dropdown)

                        return (
                            <Link
                                className={`relative z-10 rounded-full p-[0.4vw] px-[1.2vw] transition-colors duration-300 ${highlighted ? 'text-foreground' : 'text-white/70'
                                    }`}
                                key={label}
                                href={href}
                                onMouseEnter={() => handleNavEnter(index, dropdown)}
                            >
                                {label}
                                <AnimatePresence>
                                    {highlighted && (
                                        <motion.span
                                            layoutId="nav-pill"
                                            className="absolute inset-0 -z-10 rounded-full bg-primary"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ stiffness: 0, damping: 20 }}
                                        />
                                    )}
                                </AnimatePresence>
                            </Link>
                        )
                    })}
                </div>

                <NavDropdown panel={activeItem?.dropdown ?? null} />
            </div>

            <div className="flex items-center justify-center gap-[2.5vw]">
                <Button text="Install CLI" href="/effects" />
            </div>
        </nav>
    )
}
