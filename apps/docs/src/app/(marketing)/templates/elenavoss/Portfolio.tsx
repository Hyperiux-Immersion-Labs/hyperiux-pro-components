"use client"
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/dist/ScrollTrigger'
import portfolio1Img from './assets/hero-portfolio-1.png'
import portfolio2Img from './assets/hero-portfolio-2.png'
import portfolio3Img from './assets/hero-portfolio-3.png'
import portfolio4Img from './assets/hero-portfolio-4.png'
import OverflowTextReveal from './effects/overflow-text-reveal'

gsap.registerPlugin(ScrollTrigger)

const PORTFOLIO_ITEMS = [
    { name: 'Auré Studio', tags: ['Photography', 'Art Direction'] , imgSrc:portfolio1Img },
    { name: 'Veloce', tags: ['Automotive', 'Brand Experience'], imgSrc:portfolio2Img },
    { name: 'Grain Studio', tags: ['Fashion', 'Creative Direction'], imgSrc:portfolio3Img },
    { name: 'Aether', tags: ['Architecture', 'Digital Identity'], imgSrc:portfolio4Img },
]

const ROW_HEIGHT_VW = 7

// The curved top edge is a clip-path ellipse anchored at the box's own
// bottom-center (`at 50% 100%`) with its vertical radius pinned to the
// full box height (`100%`) - that combination means the ellipse's own
// natural top just touches y=0 exactly at the horizontal center, while
// the box's top corners fall outside the ellipse and get clipped away,
// revealing whatever's behind. The horizontal radius (rx) is the only
// thing that needs to move: a SMALLER rx pulls the ellipse in narrower
// relative to the box width, which clips away more of the top corners
// and makes the dome read as steeper/more pronounced; a LARGER rx makes
// it shallower/flatter. So "curve increases" while scrolling = rx
// shrinks, and it eases back up toward CURVE_STRAIGHT_RX (visually flat -
// no finite rx is mathematically perfectly straight, but at this radius
// the ellipse's sag across the box's own width is imperceptible) whenever
// scrolling stops, or the moment the page is scrolled back to the very
// top (scrollY <= 0), regardless of whether it's still mid-scroll there.
const CURVE_STRAIGHT_RX = 1000
// The ceiling on how curved it's ever allowed to get, even at 100%
// intensity (full scroll speed) - kept well above the steepest a finite rx
// can visually read (~58-60) on purpose, so "curve fully" is capped rather
// than reachable. Sensitivity (CURVE_VELOCITY_CAP below) and this ceiling
// are independent knobs: sensitivity controls how EASILY 100% intensity is
// reached, this controls what 100% intensity actually looks like.
const CURVE_ACTIVE_RX = 85
// How strongly scroll speed pulls rx toward CURVE_ACTIVE_RX - scroll
// velocity (px/s) beyond this is treated as "fully intense." LOWER = more
// sensitive (a gentler scroll already reaches full curve); higher = less
// sensitive (needs a much faster scroll to curve at all).
const CURVE_VELOCITY_CAP = 500
// Per-frame lerp factors (current += (target-current)*factor, run every
// rAF tick) rather than a GSAP tween re-triggered on every scroll event -
// a tween restarted via overwrite:true on nearly every tick never gets to
// play out its own nominal duration before the next tick cancels and
// re-targets it, which defeats any "smooth" duration during continuously
// changing velocity (e.g. decelerating). A continuous lerp loop stays
// smooth regardless of how often the target itself moves. Asymmetric on
// purpose: curving UP (rx decreasing) stays snappy/responsive, but
// straightening (rx increasing, whether from easing off or stopping)
// eases back noticeably slower.
const CURVE_UP_LERP = 0.16
// Lower = slower/longer to reach straight (this is the "duration" knob for
// the straightening side - a lerp factor, not a tween duration in seconds).
const CURVE_DOWN_LERP = 0.01

const Portfolio = () => {
    const dotRefs = useRef<(HTMLSpanElement | null)[]>([])
    const lineFillRef = useRef<HTMLDivElement | null>(null)
    const cardRefs = useRef<(HTMLDivElement | null)[]>([])
    const curveRef = useRef<HTMLDivElement | null>(null)
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
    const prefersReducedMotionRef = useRef(false)

    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
        prefersReducedMotionRef.current = mq.matches
        setPrefersReducedMotion(mq.matches)
        const onChange = (e: MediaQueryListEvent) => {
            prefersReducedMotionRef.current = e.matches
            setPrefersReducedMotion(e.matches)
        }
        mq.addEventListener('change', onChange)
        return () => mq.removeEventListener('change', onChange)
    }, [])

    useEffect(() => {
        const steps = PORTFOLIO_ITEMS.length - 1

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: '#portfolio',
                start: '15% top',
                end: 'bottom bottom',
                scrub: true,
                // Snaps scroll position to the nearest card/content step
                // whenever scrolling stops mid-transition - scoped entirely
                // to this trigger's own range (15% top -> bottom bottom,
                // i.e. while the sticky container above is pinned), since
                // GSAP only ever snaps within the trigger it's attached to.
                // Off under reduced motion, matching this file's existing
                // policy of skipping page-driven auto-motion for it.
                ...(prefersReducedMotionRef.current ? {} : {
                    snap: {
                        snapTo: 1 / steps,
                        duration: { min: 0.2, max: 0.6 },
                        ease: 'power1.inOut',
                    },
                }),
                // markers: true,
            },
        })

        gsap.set(lineFillRef.current, { scaleY: 0 })
        gsap.set(dotRefs.current[0], { backgroundColor: '#ffffff', borderColor: '#ffffff' })
        dotRefs.current.slice(1).forEach((dot) => {
            gsap.set(dot, { backgroundColor: '#F06A0E', borderColor: 'rgba(255,255,255,0.5)' })
        })
        gsap.set(cardRefs.current, { filter: 'brightness(1)' })
        if (prefersReducedMotionRef.current) {
            cardRefs.current.slice(1).forEach((card) => {
                gsap.set(card, { opacity: 0 })
            })
        } else {
            cardRefs.current.slice(1).forEach((card) => {
                gsap.set(card, { yPercent: 100 })
            })
        }

        tl.to(lineFillRef.current, { scaleY: 1, ease: 'none', duration: steps }, 0)

        for (let i = 0; i < steps; i += 1) {
            if (prefersReducedMotionRef.current) {
                // Slide reads as vestibular-triggering motion under reduced
                // motion - the image just appears in place instead.
                tl.to(cardRefs.current[i + 1], { opacity: 1, ease: 'none', duration: 1 }, i)
            } else {
                tl.to(cardRefs.current[i + 1], { yPercent: 0, ease: 'power2.inOut', duration: 1 }, i)
            }
            tl.to(cardRefs.current[i], { filter: 'brightness(0.3)', ease: 'power2.inOut', duration: 1 }, i)
            tl.set(dotRefs.current[i + 1], { backgroundColor: '#ffffff', borderColor: '#ffffff' }, i + 1)
        }

        let velocitySt: ScrollTrigger | null = null
        let entranceSt: ScrollTrigger | null = null
        let idleTimer: ReturnType<typeof setTimeout> | null = null
        let curveFrameId: number | null = null

        if (!prefersReducedMotionRef.current) {
            gsap.to(".circle-clip",{
                yPercent:-40,
                scrollTrigger:{
                    trigger: '#portfolio',
                    start: 'top bottom',
                    end: '20% 50%',
                    scrub: true,
                    // markers:true,
                }
            })

            // Curve reacts to two independent inputs, combined by taking
            // whichever wants MORE curve at any given moment:
            //  1. Entrance position - curved (CURVE_ACTIVE_RX) right as the
            //     section starts entering from the bottom of the viewport,
            //     uncurling to straight by the time it's scrolled 20% of
            //     the way in. Tracked by its own ScrollTrigger (same
            //     trigger/range as the yPercent entrance tween above) whose
            //     only job is recording .progress - it doesn't drive
            //     anything itself, entranceIntensityRef below reads it.
            //  2. Live scroll velocity, independent of position - its own
            //     ScrollTrigger instance spanning the whole document (not
            //     scoped to #portfolio), purely so its onUpdate gives a
            //     live velocity reading on every scroll tick. getVelocity()
            //     is an instance method (scrollTrigger.getVelocity()), not
            //     a static one on the ScrollTrigger class, hence needing
            //     this dedicated instance rather than a plain window scroll
            //     listener.
            // Either one stops mattering the instant scrolling stops - the
            // idle timer below always relaxes the TARGET back to straight
            // regardless of position or why it was curved; the lerp loop
            // then eases rx toward that target every frame, at whichever
            // rate (CURVE_UP_LERP/CURVE_DOWN_LERP) matches the direction
            // it's currently moving.
            const curveState = { rx: CURVE_STRAIGHT_RX, target: CURVE_STRAIGHT_RX }
            const applyCurve = () => {
                gsap.set(curveRef.current, { clipPath: `ellipse(${curveState.rx}% 100% at 50% 100%)` })
            }
            applyCurve()

            const tickCurve = () => {
                const lerpFactor = curveState.target > curveState.rx ? CURVE_DOWN_LERP : CURVE_UP_LERP
                curveState.rx += (curveState.target - curveState.rx) * lerpFactor
                applyCurve()
                curveFrameId = requestAnimationFrame(tickCurve)
            }
            curveFrameId = requestAnimationFrame(tickCurve)

            const entranceIntensityRef = { current: 0 }
            entranceSt = ScrollTrigger.create({
                trigger: '#portfolio',
                start: 'top bottom',
                end: '20% bottom',
                onUpdate: (self) => {
                    entranceIntensityRef.current = 1 - self.progress
                },
            })

            velocitySt = ScrollTrigger.create({
                trigger: document.body,
                start: 0,
                end: 'max',
                onUpdate: (self) => {
                    // At the very top of the page, stay/go straight
                    // regardless of velocity or entrance position -
                    // overrides everything below entirely rather than just
                    // feeding it zero-intensity readings, since a fast
                    // scroll THROUGH scrollY 0 (e.g., a snap-back) would
                    // otherwise still read as high-velocity and curve anyway.
                    if (window.scrollY <= 0) {
                        if (idleTimer) clearTimeout(idleTimer)
                        curveState.target = CURVE_STRAIGHT_RX
                        return
                    }

                    const velocity = Math.abs(self.getVelocity())
                    const velocityIntensity = gsap.utils.clamp(0, 1, velocity / CURVE_VELOCITY_CAP)
                    const intensity = Math.max(velocityIntensity, entranceIntensityRef.current)
                    curveState.target = gsap.utils.interpolate(CURVE_STRAIGHT_RX, CURVE_ACTIVE_RX, intensity)

                    // Once scrolling stops, the target relaxes back to
                    // straight - the lerp loop's own CURVE_DOWN_LERP rate
                    // is what makes that relax feel slow/smooth, same as
                    // during active deceleration.
                    if (idleTimer) clearTimeout(idleTimer)
                    idleTimer = setTimeout(() => {
                        curveState.target = CURVE_STRAIGHT_RX
                    }, 150)
                },
            })
        }
        // Reduced motion: curveRef is left with no clip-path applied at
        // all, so it renders as its natural straight-edged rectangle -
        // static, no dome, no scroll-velocity reaction.

        return () => {
            velocitySt?.kill()
            entranceSt?.kill()
            if (idleTimer) clearTimeout(idleTimer)
            if (curveFrameId !== null) cancelAnimationFrame(curveFrameId)
        }
    }, [])

    return (
        <section
            className={`relative w-screen h-[360vh] text-white ${prefersReducedMotion ? 'pt-[8vw]' : 'pt-[8vw] max-[1025px]:pt-[30vw]'}`}
            id="portfolio"
        >
            <div
                ref={curveRef}
                className='w-full h-[50vh]  absolute top-0 left-0 z-2 bg-linear-to-r from-[#F16B0D] to-[#E61416] circle-clip will-change-[clip-path]'
            />

            <div className="w-screen h-screen sticky top-0 z-3 flex flex-col items-center justify-center px-[4vw] gap-[5vw] overflow-hidden bg-linear-to-r from-[#F16B0D] to-[#E61416] max-md:gap-[15vw] max-[1025px]:gap-12 max-[1025px]:px-[5vw]">
                <OverflowTextReveal stagger={0.015}>
                <h2 className="text-[5.5vw] text-center max-[1025px]:text-[6.5vw] max-md:text-[9vw]">Award Winning Work</h2>
                </OverflowTextReveal>

                <div className="w-full flex items-center gap-[4vw] max-[1025px]:flex-col max-md:gap-[15vw] max-[1025px]:items-start max-[1025px]:gap-16">
                    <div className="w-[32%] relative max-md:w-full max-[1025px]:w-[50%]">
                        {/* top stays 3.5vw (= ROW_HEIGHT_VW / 2) at every breakpoint - it
                            only depends on the first row's own height, which never
                            changes. Height does need to vary per breakpoint though: it has
                            to span (row height + the gap between rows) * (item count - 1),
                            and the gap between rows below is now different per breakpoint
                            (0 desktop / 4vw tablet / 10vw mobile) - so the line's own
                            height must grow to match, or it falls short of the last dot.
                            Desktop: (7+0)*3=21vw. Tablet: (7+4)*3=33vw. Mobile: (7+10)*3=51vw.
                            These are hand-computed, not derived from ROW_HEIGHT_VW at
                            runtime, since Tailwind's arbitrary-value classes must be static
                            literal strings in source for its scanner to generate CSS for
                            them - update these by hand if ROW_HEIGHT_VW, item count, or the
                            row gaps below ever change. */}
                        <div
                            className="absolute left-1 bg-white/20 top-[2.5vw] max-[1025px]:top-[1vw] h-[21vw] max-[1025px]:h-[33vw] max-md:h-[62vw] w-px "
                        />
                        <div
                            ref={lineFillRef}
                            className="absolute left-1 bg-white origin-top top-[2.5vw] max-[1025px]:top-[1vw] h-[21vw] max-[1025px]:h-[33vw] max-md:h-[62vw] w-px "
                        />

                        <div className="flex flex-col max-[1025px]:gap-[4vw] max-md:gap-[14vw]">
                            {PORTFOLIO_ITEMS.map((item, i) => (
                                <div
                                    key={item.name}
                                    className="relative flex items-center gap-[1.2vw] max-md:gap-[5vw]"
                                    style={{ height: `${ROW_HEIGHT_VW}vw` }}
                                >
                                    <span
                                        ref={(el) => { dotRefs.current[i] = el }}
                                        className="w-[10px] h-[10px] mt-[-1.5vw] bg-[#F06A0E] rounded-full border shrink-0 max-md:mt-[-7vw] max-[1025px]:mt-[-4vw]"
                                    />
                                    <div>
                                        <h3 className="text-[1.5vw] font-normal max-[1025px]:text-[3.5vw] max-md:text-[5.5vw]">{item.name}</h3>
                                        <p className="text-[1vw] max-[1025px]:text-[2.5vw] max-md:text-[4.2vw]">{item.tags.join('  •  ')}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="w-full h-[38vw] relative rounded-xl overflow-hidden max-[1025px]:w-full max-[1025px]:h-[52vw] max-[1025px]:rounded-lg  ">
                        {PORTFOLIO_ITEMS.map((item, i) => (
                            <div
                                key={item.name}
                                ref={(el) => { cardRefs.current[i] = el }}
                                className="absolute inset-0 bg-[#F4EFE9] flex items-center justify-center  rounded-xl overflow-hidden max-[1025px]:rounded-lg"
                                style={{ zIndex: i + 1 }}
                            >
                                <Image src={item.imgSrc} alt="portfolio-img" width={800} height={400} className="w-full h-full object-cover"/>
                                
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className='absolute w-screen h-[60vh] bottom-[-10%] left-0 overflow-hidden max-[1025px]:bottom-[-13%]'>
            <div className='w-[115%] h-[40vh]  absolute bottom-[35%] left-[-7.5%] z-2 bg-linear-to-r from-[#F16B0D] to-[#E61416] blur-2xl max-[1025px]:bottom-[50%] max-[1025px]:w-[120%] max-[1025px]:left-[-10%] max-[1025px]:blur-lg'/>

            </div>


        </section>
    )
}

export default Portfolio
