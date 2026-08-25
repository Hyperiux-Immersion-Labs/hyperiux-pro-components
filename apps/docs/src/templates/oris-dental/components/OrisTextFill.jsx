'use client'

import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import SplitText from 'gsap/SplitText'

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger, SplitText)
}

export default function OrisTextFill({
    text = '',
    className = '',
    textColor = '#ffffff',
    primaryColor = '#3365e2',
    dimColor = 'rgba(255, 255, 255, 0.25)',
    start = 'top 80%',
    end = 'bottom 40%',
    as: Tag = 'h2',
    trigger = '',
}) {
    const textRef = useRef(null)

    useEffect(() => {
        const textElement = textRef.current
        if (!textElement) return

        const triggerElement =
            (typeof trigger === 'string'
                ? trigger && document.querySelector(trigger)
                : trigger?.current ?? trigger) || textElement

        const ctx = gsap.context(() => {
            const split = SplitText.create(textElement, {
                type: 'words chars',
                aria: false,
                tag: 'span',
                charsClass: 'split-chars',
            })

            const characters = split.chars?.length
                ? Array.from(split.chars)
                : gsap.utils.toArray(textElement.querySelectorAll('.split-chars'))

            const prefersReducedMotion = window.matchMedia(
                '(prefers-reduced-motion: reduce)'
            ).matches

            if (prefersReducedMotion) {
                gsap.set(characters, { color: textColor })
                return () => {
                    gsap.killTweensOf(characters)
                    split.revert()
                }
            }

            gsap.set(characters, {
                color: dimColor,
                willChange: 'color',
            })

            let revealed = 0

            const playFill = (char) => {
                gsap.killTweensOf(char)
                gsap.fromTo(
                    char,
                    { color: dimColor },
                    {
                        keyframes: [
                            { color: primaryColor, duration: 0.15 },
                            { color: textColor, duration: 0.25 },
                        ],
                        ease: 'none',
                        overwrite: true,
                    }
                )
            }

            const snapToTarget = (target) => {
                gsap.killTweensOf(characters)
                if (target > 0) {
                    gsap.set(characters.slice(0, target), {
                        color: textColor,
                        overwrite: true,
                    })
                }
                if (target < characters.length) {
                    gsap.set(characters.slice(target), {
                        color: dimColor,
                        overwrite: true,
                    })
                }
                revealed = target
            }

            const syncFromProgress = (progress, { immediate = false } = {}) => {
                const target = Math.min(
                    characters.length,
                    Math.max(0, Math.round(progress * characters.length))
                )

                if (target === revealed) return

                if (target < revealed || immediate) {
                    snapToTarget(target)
                    return
                }

                for (let i = revealed; i < target; i++) {
                    playFill(characters[i])
                }

                revealed = target
            }

            ScrollTrigger.create({
                trigger: triggerElement,
                start,
                end,
                onUpdate: (self) => {
                    syncFromProgress(self.progress)
                },
                onRefresh: (self) => {
                    syncFromProgress(self.progress, { immediate: true })
                },
            })

            return () => {
                gsap.killTweensOf(characters)
                split.revert()
            }
        }, textRef)

        return () => ctx.revert()
    }, [dimColor, end, primaryColor, start, textColor, trigger])

    return (
        <Tag ref={textRef} className={className}>
            {text}
        </Tag>
    )
}
