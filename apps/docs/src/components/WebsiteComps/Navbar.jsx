'use client'

import { useCallback, useRef, useState } from 'react'
import { useLenis } from 'lenis/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { HyperiuxLogo } from '@/utils/Icons'
import { vaultLinks } from '@/utils/Links'
import Button from './Button'
import NavLinks from './navbar/NavLinks'
import { useNavbarLoader } from './navbar/useNavbarLoader'
import { getPageScrollProgress } from './navbar/utils'

export default function Navbar() {
    const navbarRef = useRef(null)
    const [activeItem, setActiveItem] = useState(null)

    const pathname = usePathname()

    const { hasRevealedRef, toggleNavbar } = useNavbarLoader(
        navbarRef,
        pathname,
        setActiveItem
    )

    const getUpgradeScrollOffset = useCallback(() => {
        if (pathname !== '/') return 0

        return getPageScrollProgress() < 0.85 ? -1000 : 0
    }, [pathname])

    const activeIndex = vaultLinks.findIndex((link) => {
        if (link.href === '/') return pathname === '/'
        return pathname.startsWith(link.href)
    })

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
            className="fixed top-(--announcement-offset) transition-[top] duration-300 ease-out left-0 z-999 flex w-full items-center justify-between overflow-visible px-[3.5vw] py-[2vw] max-md:hidden"
        >
            <Link prefetch={false} href="/" aria-label="Hyperiux Vault home">
                <HyperiuxLogo className="h-auto w-[13vw] text-primary" />
            </Link>

            <NavLinks
                activeItem={activeItem}
                onNavEnter={handleNavEnter}
                onNavLeave={handleNavLeave}
                isHighlighted={isHighlighted}
            />

            <div className="flex items-center justify-center gap-[1vw]">
                {/* Clerk-free by design: marketing routes render without
                    ClerkProvider, so this navbar always shows the anonymous
                    state. Plan-aware UI lives in the (app) group. */}
                <Button
                    text="Join Founding Access"
                    href="/waitlist"
                    className="border-white/40! bg-[#0E0E0E]!"
                    variant="outline2"
                    scrollOffset={getUpgradeScrollOffset}
                />
                <Button
                    text="Install CLI"
                    href="/docs/installation"
                    onClick={() =>
                        window.dataLayer?.push({
                            event: 'install_cli_click',
                            location: 'homepage_navbar',
                        })
                    }
                    prefetch={false}
                />
            </div>
        </nav>
    )
}
