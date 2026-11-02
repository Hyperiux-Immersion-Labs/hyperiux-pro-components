// Built using Hyperiux Vault: https://vault.hyperiux.com
'use client'

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import gsap from 'gsap'
import './oris-dental.css'
import LenisSmoothScroll from './LenisSmoothScroll'
import DotsCanvas from './teeth-3d/DotsCanvas'
import DotFillBtn from './effects/dot-fill-btn/DotFillBtn'

const HOME = "/template-demo/oris-dental";
const TITLE = 'Page not found | Oris Dental'

// The 3D tooth that stands in for the "0"; three.js loads only on this page, in the browser.
// The download starts as soon as this module runs instead of waiting for the first render.
const loadTooth = () => import('./teeth-3d/Tooth404')
if (typeof window !== 'undefined') loadTooth()
const Tooth404 = dynamic(loadTooth, { ssr: false })

// The intro waits for the tooth's first frame so the digits and copy rise with it,
// but never longer than this (no WebGL, very slow device)
const TOOTH_WAIT = 2

export default function NotFound() {
    // A 404 only gets its layout's metadata title, and Next can stream that in after
    // this runs, so the tab title is set here and re-applied whenever <head> changes.
    // That rewrites the layout's own <title>, so its text is restored on the way out.
    useEffect(() => {
        const originals = new Map<HTMLTitleElement, string>()
        const apply = () => {
            const el = document.querySelector('title')
            if (!el || el.textContent === TITLE) return
            if (!originals.has(el)) originals.set(el, el.textContent ?? '')
            el.textContent = TITLE
        }
        apply()
        const observer = new MutationObserver(apply)
        observer.observe(document.head, { childList: true, subtree: true, characterData: true })
        return () => {
            observer.disconnect()
            originals.forEach((text, el) => {
                if (el.isConnected && el.textContent === TITLE) el.textContent = text
            })
        }
    }, [])
    const rootRef = useRef<HTMLElement | null>(null)
    // The tooth smiles while "Back to Home" is hovered or focused
    const smile = useRef(0)
    const [reducedMotion, setReducedMotion] = useState(false)
    const intro = useRef<gsap.core.Timeline | null>(null)
    const toothReady = useRef(false)
    const handleToothReady = () => {
        toothReady.current = true
        intro.current?.play()
    }

    useEffect(() => {
        const query = window.matchMedia('(prefers-reduced-motion: reduce)')
        const sync = () => setReducedMotion(query.matches)
        sync()
        query.addEventListener('change', sync)
        return () => query.removeEventListener('change', sync)
    }, [])

    useLayoutEffect(() => {
        const root = rootRef.current
        if (!root) return

        const mm = gsap.matchMedia()
        mm.add('(prefers-reduced-motion: no-preference)', () => {
            // Paused: the from() states still apply now, so nothing shows before it plays
            const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } })
            intro.current = tl
            tl.from(root.querySelectorAll('[data-oris-bar]'), { yPercent: -100, opacity: 0, duration: 0.8 })
                .from(root.querySelectorAll('[data-oris-digit]'), { yPercent: 105, duration: 1.1, stagger: 0.08 }, 0.1)
                .from(root.querySelectorAll('[data-oris-line]'), { yPercent: 100, duration: 0.85, stagger: 0.08 }, 0.45)
                .from(root.querySelectorAll('[data-oris-fade]'), { y: 24, opacity: 0, duration: 0.8, stagger: 0.1 }, 0.75)

            if (toothReady.current) tl.play()
            const fallback = gsap.delayedCall(TOOTH_WAIT, () => tl.play())
            return () => {
                fallback.kill()
                intro.current = null
            }
        }, root)

        return () => mm.revert()
    }, [])

    return (
        <main ref={rootRef} id='main' className='bg-white oris-dental-main'>
            <LenisSmoothScroll lerp={0.1} />

            <section
                id='oris-404'
                className='relative flex min-h-svh w-full flex-col overflow-hidden bg-[linear-gradient(to_top,#3365E2_0%,#3365E2_20%,#4a78e7_40%,#789ef1_60%,#b9d0fb_80%,#ffffff_100%)] text-white'
            >
                <DotsCanvas spacing={22} lerpFactor={0.15} baseRadius={1.4} maxRadius={3.8} interactionRadius={200} />

                <header data-oris-bar className='relative z-10 flex w-full items-center justify-between oris-paddx py-[1.5vw] max-lg:py-[4vw] max-md:py-[5vw]'>
                    <Link href={HOME} aria-label='Oris Dental home' className='oris-text32 text-oris-primary'>
                        OrisDental
                    </Link>
                </header>

                <div className='relative z-10 flex flex-1 flex-col items-center justify-center oris-paddx pb-[4vw] text-center max-lg:pb-[10vw] max-md:pb-[16vw] pointer-events-none *:pointer-events-auto'>
                    <h1 aria-label='404' className='flex overflow-hidden text-[15vw] font-medium! leading-[0.9]! tracking-[-0.05em] max-lg:text-[26vw] max-md:text-[34vw]'>
                        <span data-oris-digit aria-hidden='true' className='inline-block'>
                            4
                        </span>
                        <span data-oris-digit aria-hidden='true' className='relative inline-block h-[0.9em] w-[0.7em]'>
                            <Tooth404 smile={smile} reducedMotion={reducedMotion} onReady={handleToothReady} />
                        </span>
                        <span data-oris-digit aria-hidden='true' className='inline-block'>
                            4
                        </span>
                    </h1>

                    <div className='mt-[1.8vw] overflow-hidden max-lg:mt-[3vw] max-md:mt-[4vw]'>
                        <h2 data-oris-line className='text-[2.4vw] leading-[1.2] tracking-[-0.01em] font-medium! max-lg:text-[4.2vw] max-md:text-[6vw]'>
                            This page slipped through the gaps
                        </h2>
                    </div>

                    <div className='mt-[1.2vw] overflow-hidden max-lg:mt-[2.5vw] max-md:mt-[4vw]'>
                        <p data-oris-line className='w-[32vw] text-[1.15vw] leading-[1.4] text-white/85 max-lg:w-[70vw] max-lg:text-[2.2vw] max-md:w-[85vw] max-md:text-[4vw]'>
                            The link may be broken or the page may have moved. Let&apos;s get you back to the clinic and your next bright smile.
                        </p>
                    </div>

                    <div
                        data-oris-fade
                        className='mt-[2.5vw] max-lg:mt-[5vw] max-md:mt-[8vw]'
                        onPointerEnter={() => (smile.current = 1)}
                        onPointerLeave={() => (smile.current = 0)}
                        onFocus={() => (smile.current = 1)}
                        onBlur={() => (smile.current = 0)}
                    >
                        <DotFillBtn
                            btnText='Back to Home'
                            href={HOME}
                            bgColor='#ffffff'
                            textColor='#3365e2'
                            hoverTextColor='#ffffff'
                            dotColor='#3365e2'
                            className='border border-white'
                            textClassName='text-[1vw] max-md:text-sm max-lg:text-xl font-medium'
                        />
                    </div>
                </div>

                <p data-oris-fade className='relative z-10 oris-paddx pb-[1.5vw] text-[0.9vw] text-white/70 max-lg:pb-[4vw] max-lg:text-[2.2vw] max-md:pb-[6vw] max-md:text-[3.2vw]'>
                    &copy; 2026 Oris Dental. All Rights Reserved.
                </p>
            </section>
        </main>
    )
}
