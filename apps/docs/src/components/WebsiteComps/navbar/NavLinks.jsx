'use client'

import Link from 'next/link'
import { AnimatePresence, motion } from 'motion/react'

import { vaultLinks } from '@/utils/Links'
import NavDropdown from './NavDropdown'

export default function NavLinks({
    activeItem,
    onNavEnter,
    onNavLeave,
    isHighlighted,
}) {
    return (
        <div
            className="relative ml-[13.5vw]"
            onMouseLeave={onNavLeave}
        >
            <div className="text20 relative flex gap-[0.6vw] rounded-full bg-grey p-[0.6vw] font-medium">
                {vaultLinks.map(({ label, href, dropdown }, index) => {
                    const highlighted = isHighlighted(index, dropdown)
                    const isExternal = href.startsWith('http')
                    const itemClassName = `relative z-10 rounded-full p-[0.4vw] px-[1.2vw] text-[1.15vw] font-medium tracking-wide transition-colors duration-300 ${
                        highlighted ? 'text-foreground' : 'text-white/70'
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
                                onMouseEnter={() => onNavEnter(index, dropdown)}
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
                                isExternal ? 'noopener noreferrer' : undefined
                            }
                            onMouseEnter={() => onNavEnter(index, dropdown)}
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
    )
}
