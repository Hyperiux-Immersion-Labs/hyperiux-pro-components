'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLenis } from 'lenis/react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'

import { HyperiuxLogo } from '@/utils/Icons'
import { navCategoryColumns, navDocsItems, vaultLinks } from '@/utils/Links'
import Button from './Button'
import { LOADER_STORAGE_KEY } from './Loader'

gsap.registerPlugin(SplitText)

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

const DROPDOWN_TEXT_ANIM = {
    duration: 0.4,
    leaveDuration: 0.4,
    stagger: 0.012,
    leaveStagger: 0.012,
    ease: 'power3.out',
    leaveEase: 'power3.out',
    idleColor: 'rgba(255, 255, 255, 0.75)',
    hoverColor: '#ffffff',
}

const LOADER_COMPLETE_EVENT = 'loaderComplete'
const HYPERIUX_LOADER_COMPLETE_EVENT = 'hyperiux:loader-complete'

function isLoaderRunning() {
    if (typeof window === 'undefined') return false

    return (
        document.body.classList.contains('loader-active') ||
        window.__HYPERIUX_LOADER_RUNNING__ === true
    )
}

function hasLoaderCompleted() {
    if (typeof window === 'undefined') return false

    return (
        window.sessionStorage.getItem(LOADER_STORAGE_KEY) === 'true' ||
        window.__HYPERIUX_LOADER_COMPLETE__ === true
    )
}

function markLoaderCompleted() {
    if (typeof window === 'undefined') return

    try {
        window.sessionStorage.setItem(LOADER_STORAGE_KEY, 'true')
    } catch (_) {}

    window.__HYPERIUX_LOADER_COMPLETE__ = true
    window.__HYPERIUX_LOADER_RUNNING__ = false
    document.body.classList.remove('loader-active')
}

const useIsomorphicLayoutEffect =
    typeof window !== 'undefined' ? useLayoutEffect : useEffect

function getPaneHeight(element) {
    if (!element) return 0
    return element.offsetHeight || element.scrollHeight || 0
}

function NavDropdownItem({ label, href, icon, hoverGroupRef }) {
    const defaultLabelRef = useRef(null)
    const hoverLabelRef = useRef(null)

    const splitRef = useRef({
        default: null,
        hover: null,
    })

    const getChars = useCallback(() => {
        const { default: defaultSplit, hover: hoverSplit } = splitRef.current

        if (!defaultSplit?.chars?.length || !hoverSplit?.chars?.length) {
            return null
        }

        return {
            defaultChars: defaultSplit.chars,
            hoverChars: hoverSplit.chars,
            allChars: [...defaultSplit.chars, ...hoverSplit.chars],
        }
    }, [])

    const setIdleText = useCallback(() => {
        const chars = getChars()
        if (!chars) return

        const { defaultChars, hoverChars, allChars } = chars

        gsap.killTweensOf(allChars)

        gsap.set(defaultChars, {
            yPercent: 0,
            autoAlpha: 1,
            color: DROPDOWN_TEXT_ANIM.idleColor,
            force3D: true,
        })

        gsap.set(hoverChars, {
            yPercent: 100,
            autoAlpha: 1,
            color: DROPDOWN_TEXT_ANIM.hoverColor,
            force3D: true,
        })
    }, [getChars])

    const playEnter = useCallback(() => {
        const chars = getChars()
        if (!chars) return

        const { defaultChars, hoverChars, allChars } = chars

        gsap.killTweensOf(allChars)

        gsap.to(defaultChars, {
            yPercent: -100,
            color: DROPDOWN_TEXT_ANIM.hoverColor,
            duration: DROPDOWN_TEXT_ANIM.duration,
            stagger: {
                each: DROPDOWN_TEXT_ANIM.stagger,
                from: 'start',
            },
            ease: DROPDOWN_TEXT_ANIM.ease,
            overwrite: true,
        })

        gsap.fromTo(
            hoverChars,
            {
                yPercent: 100,
                color: DROPDOWN_TEXT_ANIM.hoverColor,
            },
            {
                yPercent: 0,
                color: DROPDOWN_TEXT_ANIM.hoverColor,
                duration: DROPDOWN_TEXT_ANIM.duration,
                stagger: {
                    each: DROPDOWN_TEXT_ANIM.stagger,
                    from: 'start',
                },
                ease: DROPDOWN_TEXT_ANIM.ease,
                overwrite: true,
            }
        )
    }, [getChars])

    const playLeave = useCallback(() => {
        const chars = getChars()
        if (!chars) return

        const { defaultChars, hoverChars, allChars } = chars

        gsap.killTweensOf(allChars)

        gsap.to(defaultChars, {
            yPercent: 0,
            color: DROPDOWN_TEXT_ANIM.idleColor,
            duration: DROPDOWN_TEXT_ANIM.leaveDuration,
            stagger: {
                each: DROPDOWN_TEXT_ANIM.leaveStagger,
                from: 'end',
            },
            ease: DROPDOWN_TEXT_ANIM.leaveEase,
            overwrite: true,
        })

        gsap.to(hoverChars, {
            yPercent: 100,
            color: DROPDOWN_TEXT_ANIM.hoverColor,
            duration: DROPDOWN_TEXT_ANIM.leaveDuration,
            stagger: {
                each: DROPDOWN_TEXT_ANIM.leaveStagger,
                from: 'end',
            },
            ease: DROPDOWN_TEXT_ANIM.leaveEase,
            overwrite: true,
        })
    }, [getChars])

    useIsomorphicLayoutEffect(() => {
        const defaultEl = defaultLabelRef.current
        const hoverEl = hoverLabelRef.current

        if (!defaultEl || !hoverEl) return

        let defaultSplit = null
        let hoverSplit = null
        let cancelled = false

        const initSplit = async () => {
            if (document.fonts?.ready) {
                try {
                    await document.fonts.ready
                } catch (_) {}
            }

            if (
                cancelled ||
                !defaultLabelRef.current ||
                !hoverLabelRef.current
            ) {
                return
            }

            defaultSplit = SplitText.create(defaultLabelRef.current, {
                type: 'chars',
                mask: 'chars',
                charsClass: 'nav-dropdown-char',
            })

            hoverSplit = SplitText.create(hoverLabelRef.current, {
                type: 'chars',
                mask: 'chars',
                charsClass: 'nav-dropdown-shadow-char',
            })

            splitRef.current = {
                default: defaultSplit,
                hover: hoverSplit,
            }

            gsap.set([...defaultSplit.chars, ...hoverSplit.chars], {
                display: 'inline-block',
                willChange: 'transform',
                force3D: true,
            })

            setIdleText()
        }

        initSplit()

        return () => {
            cancelled = true

            gsap.killTweensOf([
                ...(defaultSplit?.chars || []),
                ...(hoverSplit?.chars || []),
            ])

            defaultSplit?.revert()
            hoverSplit?.revert()

            splitRef.current = {
                default: null,
                hover: null,
            }
        }
    }, [label, setIdleText])

    useEffect(() => {
        if (!hoverGroupRef) return

        const group = hoverGroupRef.current

        group.resetters.set(label, playLeave)

        return () => {
            group.resetters.delete(label)

            if (group.activeKey === label) {
                group.activeKey = null
            }
        }
    }, [hoverGroupRef, label, playLeave])

    const handleTextEnter = useCallback(() => {
        if (hoverGroupRef) {
            const group = hoverGroupRef.current

            if (group.activeKey && group.activeKey !== label) {
                group.resetters.get(group.activeKey)?.()
            }

            group.activeKey = label
        }

        playEnter()
    }, [hoverGroupRef, label, playEnter])

    const handleTextLeave = useCallback(
        (event) => {
            const related = event.relatedTarget

            const movingToSibling =
                related instanceof Element &&
                related.closest('[data-nav-dropdown-link]')

            playLeave()

            if (!hoverGroupRef) return

            if (hoverGroupRef.current.activeKey === label) {
                hoverGroupRef.current.activeKey = null
            }

            if (movingToSibling) return
        },
        [hoverGroupRef, label, playLeave]
    )

    return (
        <Link
            href={href}
            data-nav-dropdown-link
            className="group flex items-center gap-[0.75vw] rounded-[0.55vw] px-[0.7vw] py-[0.8vw] transition-colors duration-300 hover:bg-black"
            onMouseEnter={handleTextEnter}
            onMouseLeave={handleTextLeave}
        >
            <span className="relative flex size-[1.35vw] shrink-0 items-center justify-center">
                <Image
                    src={icon}
                    alt=""
                    width={35}
                    height={35}
                    aria-hidden="true"
                    className="size-full object-contain"
                />
            </span>

            <span className="relative block overflow-hidden text-[1.05vw] font-medium whitespace-nowrap leading-[1.15]">
                <span
                    ref={defaultLabelRef}
                    className="block"
                    aria-hidden="true"
                >
                    {label}
                </span>

                <span
                    ref={hoverLabelRef}
                    className="pointer-events-none absolute inset-0 block"
                    aria-hidden="true"
                >
                    {label}
                </span>

                <span className="sr-only">{label}</span>
            </span>
        </Link>
    )
}

function CategoriesPanel({ hoverGroupRef }) {
    return (
        <div className="grid grid-cols-2 gap-x-[1.6vw] gap-y-[0.15vw]">
            {navCategoryColumns.map((column, columnIndex) => (
                <div key={columnIndex} className="flex flex-col">
                    {column.map((item) => (
                        <NavDropdownItem
                            key={item.label}
                            hoverGroupRef={hoverGroupRef}
                            {...item}
                        />
                    ))}
                </div>
            ))}
        </div>
    )
}

function DocsPanel({ hoverGroupRef }) {
    return (
        <div className="flex flex-col gap-[0.15vw]">
            {navDocsItems.map((item) => (
                <NavDropdownItem
                    key={item.label}
                    hoverGroupRef={hoverGroupRef}
                    {...item}
                />
            ))}
        </div>
    )
}

const PANELS = {
    categories: { width: '35vw', Panel: CategoriesPanel, index: 0 },
    docs: { width: '18vw', Panel: DocsPanel, index: 1 },
}

function NavDropdown({ panel }) {
    const shellRef = useRef(null)
    const viewportRef = useRef(null)
    const currentPaneRef = useRef(null)
    const nextPaneRef = useRef(null)
    const tlRef = useRef(null)
    const hoverGroupRef = useRef({ activeKey: null, resetters: new Map() })

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

        gsap.killTweensOf([
            shellRef.current,
            viewportRef.current,
            currentPaneRef.current,
            nextPaneRef.current,
        ])
    }

    const reset = () => {
        hoverGroupRef.current.resetters.forEach((resetItem) => resetItem())
        hoverGroupRef.current.activeKey = null

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

        if (!wasOpen) {
            animRef.current.hasOpenedOnce = false
        }

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
        if (
            !animRef.current.isOpen ||
            !currentPanel ||
            !viewportRef.current ||
            !currentPaneRef.current
        ) {
            return
        }

        killTweens()

        const contentHeight = getPaneHeight(currentPaneRef.current)
        const anim = animRef.current

        if (shellRef.current) {
            gsap.set(shellRef.current, {
                width: PANELS[currentPanel].width,
            })
        }

        if (!anim.hasOpenedOnce) {
            gsap.set(viewportRef.current, {
                height: contentHeight,
            })

            gsap.set(shellRef.current, {
                opacity: 0,
            })

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

        gsap.set(viewportRef.current, {
            height: contentHeight,
        })
    }, [currentPanel])

    useIsomorphicLayoutEffect(() => {
        if (
            !currentPanel ||
            !currentPaneRef.current ||
            !viewportRef.current ||
            nextPanel !== null
        ) {
            return
        }

        gsap.set(viewportRef.current, {
            height: getPaneHeight(currentPaneRef.current),
        })
    }, [currentPanel, nextPanel])

    useIsomorphicLayoutEffect(() => {
        if (
            nextPanel === null ||
            !currentPaneRef.current ||
            !nextPaneRef.current ||
            !viewportRef.current
        ) {
            return
        }

        const currentEl = currentPaneRef.current
        const nextEl = nextPaneRef.current
        const targetPanel = nextPanel
        const dir = animRef.current.direction

        const {
            distance,
            duration,
            ease,
            fade,
            heightDuration,
            heightEase,
            widthDuration,
            widthEase,
        } = MENU_ANIM

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

        gsap.set(viewportRef.current, {
            height: getPaneHeight(currentEl),
        })

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

                if (queued && queued !== targetPanel) {
                    requestSwitch(queued)
                }
            },
        })

        tlRef.current
            .to(
                viewportRef.current,
                {
                    height: getPaneHeight(nextEl),
                    duration: heightDuration,
                    ease: heightEase,
                },
                0
            )
            .to(
                shellRef.current,
                {
                    width: PANELS[targetPanel].width,
                    duration: widthDuration,
                    ease: widthEase,
                },
                0
            )
            .to(
                currentEl,
                {
                    x: dir > 0 ? -distance : distance,
                    opacity: fade ? 0 : 1,
                    duration,
                    ease,
                },
                0
            )
            .to(
                nextEl,
                {
                    x: 0,
                    opacity: 1,
                    duration,
                    ease,
                },
                0
            )
    }, [nextPanel])

    useEffect(() => {
        return () => {
            killTweens()
        }
    }, [])

    if (!currentPanel) return null

    const Panel = currentPanel ? PANELS[currentPanel].Panel : null
    const NextPanel = nextPanel ? PANELS[nextPanel].Panel : null

    return (
        <div className="absolute top-full left-1/2 z-50 w-max -translate-x-1/2 pt-[0.75vw]">
            <div
                ref={shellRef}
                className="overflow-hidden rounded-[1.1vw] border border-white/8 bg-grey p-[1vw] shadow-[0_1.2vw_3.5vw_rgba(0,0,0,0.55)]"
                style={{
                    width: currentPanel
                        ? PANELS[currentPanel].width
                        : PANELS.categories.width,
                }}
            >
                <div ref={viewportRef} className="relative">
                    {Panel && (
                        <div
                            key={`current-${currentPanel}`}
                            ref={currentPaneRef}
                            className="relative w-full"
                        >
                            <Panel hoverGroupRef={hoverGroupRef} />
                        </div>
                    )}

                    {NextPanel && (
                        <div
                            key={`next-${nextPanel}`}
                            ref={nextPaneRef}
                            className="absolute top-0 left-0 w-full"
                        >
                            <NextPanel hoverGroupRef={hoverGroupRef} />
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
    const hasRevealedRef = useRef(false)
    const [activeItem, setActiveItem] = useState(null)

    const pathname = usePathname()

    const activeIndex = vaultLinks.findIndex((link) => {
        if (link.href === '/') return pathname === '/'
        return pathname.startsWith(link.href)
    })

    const showNavbar = useCallback((animate = false) => {
        const navbar = navbarRef.current

        if (!navbar) return

        hidden.current = false

        gsap.killTweensOf(navbar)

        if (animate) {
            gsap.to(navbar, {
                autoAlpha: 1,
                y: 0,
                yPercent: 0,
                duration: 0.45,
                ease: 'power2.out',
                overwrite: true,
                onComplete: () => {
                    gsap.set(navbar, {
                        clearProps: 'transform',
                    })
                },
            })

            return
        }

        gsap.set(navbar, {
            autoAlpha: 1,
            y: 0,
            yPercent: 0,
            clearProps: 'transform',
        })
    }, [])

    const hideNavbarForLoader = useCallback(() => {
        const navbar = navbarRef.current

        if (!navbar) return

        hidden.current = true

        gsap.killTweensOf(navbar)

        gsap.set(navbar, {
            autoAlpha: 0,
            y: -18,
            yPercent: 0,
        })
    }, [])

    const toggleNavbar = useCallback((hide) => {
        const navbar = navbarRef.current

        if (!navbar || hidden.current === hide) return

        hidden.current = hide

        if (hide) {
            setActiveItem(null)
        }

        gsap.killTweensOf(navbar)

        gsap.to(navbar, {
            yPercent: hide ? -100 : 0,
            autoAlpha: 1,
            duration: 0.45,
            ease: 'power2.out',
            overwrite: true,
        })
    }, [])

    useEffect(() => {
        if (typeof window === 'undefined') return

        let pollId = null
        let revealFrame = null
        let fallbackTimer = null

        const revealNavbar = (animate = true) => {
            if (hasRevealedRef.current) return
            if (!navbarRef.current) return

            hasRevealedRef.current = true
            hidden.current = false

            showNavbar(animate)
        }

        const syncNavbarWithLoader = () => {
            if (!navbarRef.current) return

            const loaderRunning = isLoaderRunning()
            const loaderCompleted = hasLoaderCompleted()

            if (loaderRunning && !loaderCompleted) {
                hasRevealedRef.current = false
                hideNavbarForLoader()
                return
            }

            if (loaderCompleted || !loaderRunning) {
                revealNavbar(true)
            }
        }

        const handleLoaderComplete = () => {
            markLoaderCompleted()

            if (revealFrame) {
                window.cancelAnimationFrame(revealFrame)
            }

            revealFrame = window.requestAnimationFrame(() => {
                revealNavbar(true)
            })
        }

        syncNavbarWithLoader()

        pollId = window.setInterval(() => {
            syncNavbarWithLoader()

            if (hasRevealedRef.current && pollId) {
                window.clearInterval(pollId)
                pollId = null
            }
        }, 80)

        fallbackTimer = window.setTimeout(() => {
            if (!hasRevealedRef.current && !isLoaderRunning()) {
                revealNavbar(true)
            }
        }, 900)

        window.addEventListener(LOADER_COMPLETE_EVENT, handleLoaderComplete)
        window.addEventListener(
            HYPERIUX_LOADER_COMPLETE_EVENT,
            handleLoaderComplete
        )

        return () => {
            if (pollId) {
                window.clearInterval(pollId)
            }

            if (revealFrame) {
                window.cancelAnimationFrame(revealFrame)
            }

            if (fallbackTimer) {
                window.clearTimeout(fallbackTimer)
            }

            window.removeEventListener(
                LOADER_COMPLETE_EVENT,
                handleLoaderComplete
            )

            window.removeEventListener(
                HYPERIUX_LOADER_COMPLETE_EVENT,
                handleLoaderComplete
            )
        }
    }, [pathname, hideNavbarForLoader, showNavbar])

    useLenis(({ scroll, velocity }) => {
        if (!hasRevealedRef.current) return

        if (scroll < 100) {
            toggleNavbar(false)
            return
        }

        if (velocity > 0.1) {
            toggleNavbar(true)
        } else if (velocity < -0.2) {
            toggleNavbar(false)
        }
    })

    const handleNavEnter = useCallback((index, dropdown) => {
        setActiveItem({
            index,
            dropdown: dropdown ?? null,
        })
    }, [])

    const handleNavLeave = useCallback(() => {
        setActiveItem(null)
    }, [])

    const isHighlighted = useCallback(
        (index, dropdown) => {
            if (activeItem?.dropdown && dropdown) {
                return activeItem.dropdown === dropdown
            }

            if (activeItem) {
                return activeItem.index === index
            }

            return activeIndex === index
        },
        [activeIndex, activeItem]
    )

    return (
        <nav
            id="navigation"
            ref={navbarRef}
            style={{
                opacity: 0,
                transform: 'translateY(-18px)',
            }}
            className="fixed top-0 left-0 z-999 flex w-full items-center justify-between overflow-visible px-[3.5vw] py-[2vw] max-md:hidden"
        >
            <Link href="/">
                <HyperiuxLogo className="h-auto w-[13vw] text-primary" />
            </Link>

            <div className="relative" onMouseLeave={handleNavLeave}>
                <div className="text20 relative flex gap-[0.6vw] rounded-full bg-grey translate-x-[3.6vw] p-[0.6vw] font-medium">
                    {vaultLinks.map(({ label, href, dropdown }, index) => {
                        const highlighted = isHighlighted(index, dropdown)
                        const isExternal = href.startsWith('http')
                        const itemClassName = `relative z-10 rounded-full p-[0.4vw] px-[1.2vw] text-[1.15vw] font-medium tracking-wide transition-colors duration-300 ${
                            highlighted
                                ? 'text-foreground'
                                : 'text-white/70'
                        }`

                        const pill = (
                            <AnimatePresence>
                                {highlighted && (
                                    <motion.span
                                        layoutId="nav-pill"
                                        className="absolute inset-0 -z-10 rounded-full bg-primary"
                                        initial={{
                                            opacity: 0,
                                        }}
                                        animate={{
                                            opacity: 1,
                                        }}
                                        exit={{
                                            opacity: 0,
                                        }}
                                        transition={{
                                            stiffness: 0,
                                            damping: 20,
                                        }}
                                    />
                                )}
                            </AnimatePresence>
                        )

                        if (dropdown) {
                            return (
                                <button
                                    key={label}
                                    type="button"
                                    onMouseEnter={() =>
                                        handleNavEnter(index, dropdown)
                                    }
                                    className={itemClassName}
                                >
                                    {label}
                                    {pill}
                                </button>
                            )
                        }

                        return (
                            <Link
                                key={label}
                                href={href}
                                target={isExternal ? '_blank' : undefined}
                                rel={
                                    isExternal
                                        ? 'noopener noreferrer'
                                        : undefined
                                }
                                onMouseEnter={() =>
                                    handleNavEnter(index, dropdown)
                                }
                                className={itemClassName}
                            >
                                {label}
                                {pill}
                            </Link>
                        )
                    })}
                </div>

                <NavDropdown panel={activeItem?.dropdown ?? null} />
            </div>

            <div className="flex items-center justify-center gap-[2vw]">
                <Button variant='black' className='' text="Install CLI" href="/docs/installation" />
                <Button text="Start Free" href="/docs/installation" />
            </div>
        </nav>
    )
}