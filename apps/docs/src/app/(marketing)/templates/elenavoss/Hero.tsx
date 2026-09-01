"use client"
import Image from 'next/image'
import elenavossHeroImg from './assets/hero-bg-full-img.png'
import portfolio1Img from './assets/portfolio-img-1.png'
import portfolio2Img from './assets/portfolio-img-2.png'
import portfolio3Img from './assets/portfolio-img-3.png'
import portfolio4Img from './assets/portfolio-img-4.png'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/dist/ScrollTrigger'
import { useLenis } from 'lenis/react'
import OverflowTextReveal from './effects/overflow-text-reveal'
gsap.registerPlugin(ScrollTrigger)

// Diagonal wipe reveal, driven by the --reveal custom property consumed by
// .hero-mask-reveal's mask-image (elenavoss.css). 0% = fully masked, 125%
// overshoots past the far corner so the soft transition band fully clears
// the box (no lingering fade at 100%, since the band itself is 25% wide).
const MASK_REVEAL_START = -40
const MASK_REVEAL_END = 125

// The image wipe runs on roughly the same timescale as the h1's own
// stagger reveal - a fast-starting ease makes it visibly moving from frame
// one instead of a slow ramp-up that reads as "delayed".
const IMAGE_REVEAL_DURATION = 3.5

// Intro sequence: a single gsap.timeline() (see the mount effect below)
// schedules every stage as a fixed offset in seconds from timeline start
// (image reveal begins at 0) instead of chaining each stage off the
// previous one's onComplete. All four offsets below are just playback
// positions on that timeline - retune any of them directly to taste.
const HOW_EARLY_H1_STARTS = 2.5
const H1_START_OFFSET = Math.max(IMAGE_REVEAL_DURATION - HOW_EARLY_H1_STARTS, 0)
// Side paragraphs start this many seconds after the h1 starts revealing.
const SIDE_TEXT_START_OFFSET = H1_START_OFFSET + 0.5
// Header/logo fade in this many seconds after the side paragraphs start.
const HEADER_START_OFFSET = SIDE_TEXT_START_OFFSET + 0.3

// Cursor parallax: the portrait (closer/bigger, reads as "foreground")
// drifts further than the text (reads as "further back") on the X axis,
// both moving the same direction, both lerped toward the cursor's
// normalized -1..1 position for a smooth catch-up rather than snapping
// straight to it. The Y axis drifts too, but image and text move opposite
// ways vertically (image follows the cursor, text counters it) - that
// cross-motion is what actually reads as depth/parallax, rather than the
// whole hero just sliding as one block.
const IMAGE_PARALLAX_MAX_X = 30
const TEXT_PARALLAX_MAX_X = 12
const IMAGE_PARALLAX_MAX_Y = 30
const TEXT_PARALLAX_MAX_Y = 12
const PARALLAX_LERP = 0.08

// translateY(-51.1%) in elenavoss.css loops seamlessly because each list
// below is two repeats of the same short sequence - the halfway point lands
// back on matching content. That stays true whatever the sequence length is,
// so mobile can use a longer (denser) sequence than desktop without touching
// the animation. Mobile's column is much taller per tile (see max-md:h- below),
// so it needs more images to avoid looking sparse.
const DESKTOP_MARQUEE_1 = [portfolio1Img, portfolio3Img, portfolio1Img, portfolio3Img]
const DESKTOP_MARQUEE_2 = [portfolio2Img, portfolio4Img, portfolio2Img, portfolio4Img]
const MOBILE_MARQUEE_IMAGES = [
    portfolio1Img, portfolio2Img, portfolio3Img, portfolio4Img,
    portfolio1Img, portfolio2Img, portfolio3Img, portfolio4Img,
]
const MOBILE_MARQUEE_QUERY = '(max-width: 1025px)'

const Hero = () => {
    const heroSectionRef = useRef<HTMLElement | null>(null)
    const heroContainerRef = useRef<HTMLDivElement | null>(null)
    const heroAvImgRef = useRef<HTMLDivElement | null>(null)
    const heroTextRef = useRef<HTMLDivElement | null>(null)
    const imgRevealRef = useRef<HTMLDivElement | null>(null)
    const introPlayedRef = useRef(false)
    const [isMobileMarquee, setIsMobileMarquee] = useState(false)
    // Gate when each stage's OverflowTextReveal actually starts (see the
    // "start" prop it accepts) - image is always the first mover so it
    // doesn't need a flag, it just plays on mount below.
    const [startH1, setStartH1] = useState(false)
    const [startSideText, setStartSideText] = useState(false)
    const lenis = useLenis()
    // useLenis() returns undefined for the first render or two, then the
    // real instance - read through a ref inside the intro timeline's header
    // stage (below) instead of closing over `lenis` directly, since that
    // effect only runs once on mount and would otherwise capture the stale
    // undefined value.
    const lenisRef = useRef(lenis)
    useEffect(() => {
        lenisRef.current = lenis
    }, [lenis])

    // A reload (not just first visit) can otherwise land wherever the
    // browser's own scroll-restoration puts it (mid-page, if that's where
    // the tab was scrolled before refresh) - the intro sequence below
    // (mask reveal, lenis.stop()) assumes it's starting from scrollY 0,
    // so every load/reload is forced back to the top first.
    useEffect(() => {
        if (typeof window === 'undefined') return
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual'
        }
        window.scrollTo(0, 0)
    }, [])

    useEffect(() => {
        const mq = window.matchMedia(MOBILE_MARQUEE_QUERY)
        const update = () => setIsMobileMarquee(mq.matches)
        update()
        mq.addEventListener('change', update)
        return () => mq.removeEventListener('change', update)
    }, [])

    // Image/h1/side-text/header are all hidden via a static opacity-0 class
    // in the JSX itself (not a gsap.set effect) so they're already invisible
    // in the server-rendered HTML, before hydration ever runs - a
    // useEffect-driven hide would still let the pre-hydration paint flash
    // them visible for a frame. Scroll stays locked for the whole sequence.
    useEffect(() => {
        lenis?.stop()
    }, [lenis])

    // One master timeline drives the whole intro: image reveal starts at 0,
    // then h1/side-text/header are each fired at a fixed offset (see the
    // constants above) via .call() rather than waiting on the previous
    // stage's onComplete - retune the offsets directly if a stage should
    // start earlier/later relative to the others.
    useEffect(() => {
        if (introPlayedRef.current) return
        introPlayedRef.current = true

        const maskState = { reveal: MASK_REVEAL_START }

        gsap.timeline()
            .to(maskState, {
                reveal: MASK_REVEAL_END,
                duration: IMAGE_REVEAL_DURATION,
                ease: 'power2.out',
                onUpdate: () => {
                    imgRevealRef.current?.style.setProperty('--reveal', `${maskState.reveal}%`)
                },
            }, 0)
            .fromTo(imgRevealRef.current,
                { opacity: 0 },
                { opacity: 1, duration: 1.5, ease: 'power2.out' },
                0
            )
            .call(() => setStartH1(true), undefined, H1_START_OFFSET)
            .call(() => setStartSideText(true), undefined, SIDE_TEXT_START_OFFSET)
            .call(() => {
                const headerEl = document.getElementById('header')
                // Header.tsx splits its logo into a separate #header-logo
                // element (its own fixed+blend layer, kept outside header's
                // stacking context so mix-blend-difference can reach the
                // Hero content behind it) - it has to be driven through the
                // same intro tween as #header or it'd pop in out of sync.
                const headerLogoEl = document.getElementById('header-logo')

                gsap.fromTo([headerEl, headerLogoEl],
                    { yPercent: -50, opacity: 0 },
                    {
                        yPercent: 0,
                        opacity: 1,
                        duration: 0.8,
                        ease: 'power3.out',
                        onComplete: () => lenisRef.current?.start(),
                    }
                )
            }, undefined, HEADER_START_OFFSET)
    }, [])

    // Ref-targeted (not string selectors) and mount-only (empty deps, with
    // real cleanup) so this creates exactly one ScrollTrigger for the
    // lifetime of the component. The old version had no dependency array,
    // so it re-ran and stacked a brand new, uncleaned-up ScrollTrigger on
    // every re-render this component does during the intro sequence
    // (marquee's isMobileMarquee, startH1, startSideText) - multiple
    // ScrollTriggers all driving the same element's scale from scroll
    // position is exactly what read as "glitchy". invalidateOnRefresh
    // means a resize or layout shift (images finishing load, marquee
    // swapping its image set) re-measures start/end instead of scrubbing
    // against stale cached positions.
    useEffect(() => {
        if (!heroContainerRef.current || !heroSectionRef.current) return

        const tween = gsap.to(heroContainerRef.current, {
            scale: 0.5,
            ease: "power2.inOut",
            scrollTrigger: {
                trigger: heroSectionRef.current,
                start: "top top",
                end: "bottom bottom",
                scrub: true,
                invalidateOnRefresh: true,
                // markers: true,
            },
        })

        return () => {
            tween.scrollTrigger?.kill()
            tween.kill()
        }
    }, [])

    useEffect(() => {
        if (globalThis.innerWidth <= 1024) return
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

        const state = {
            targetImgX: 0, currentImgX: 0, targetTextX: 0, currentTextX: 0,
            targetImgY: 0, currentImgY: 0, targetTextY: 0, currentTextY: 0,
        }

        const handleMouseMove = (e: MouseEvent) => {
            const normalizedX = (e.clientX / window.innerWidth) * 2 - 1 // -1..1
            const normalizedY = (e.clientY / window.innerHeight) * 2 - 1 // -1..1
            state.targetImgX = -normalizedX * IMAGE_PARALLAX_MAX_X
            state.targetTextX = -normalizedX * TEXT_PARALLAX_MAX_X
            // Opposite sign from each other (not from the X axis) - image
            // follows the cursor's Y position, text counters it, so they
            // visibly move apart/together instead of drifting as one unit.
            state.targetImgY = -normalizedY * IMAGE_PARALLAX_MAX_Y
            state.targetTextY = -normalizedY * TEXT_PARALLAX_MAX_Y
        }
        window.addEventListener('mousemove', handleMouseMove)

        let frameId: number
        const tick = () => {
            state.currentImgX += (state.targetImgX - state.currentImgX) * PARALLAX_LERP
            state.currentTextX += (state.targetTextX - state.currentTextX) * PARALLAX_LERP
            state.currentImgY += (state.targetImgY - state.currentImgY) * PARALLAX_LERP
            state.currentTextY += (state.targetTextY - state.currentTextY) * PARALLAX_LERP
            gsap.set(heroAvImgRef.current, { x: state.currentImgX, y: state.currentImgY })
            gsap.set(heroTextRef.current, { x: state.currentTextX, y: state.currentTextY })
            frameId = requestAnimationFrame(tick)
        }
        frameId = requestAnimationFrame(tick)

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            cancelAnimationFrame(frameId)
        }
    }, [])
    return (
        <section ref={heroSectionRef} className="relative w-screen h-[300vh]" id='hero'>
            <div
                ref={heroContainerRef}
                className="w-screen h-screen sticky top-0 flex justify-between items-center hero-container px-[4vw] z-2 max-[1025px]:px-[5vw]  max-[1025px]:items-start max-[1025px]:pt-[30vw] overflow-hidden"
                style={{
                    backgroundColor: '#180d08',
                    backgroundImage: `
                        radial-gradient(65% 55% at 92% 6%, #F0640D 0%, rgba(240,100,13,0) 65%),
                        radial-gradient(60% 55% at 4% 82%, #EC690F 0%, rgba(236,105,15,0) 65%),
                        radial-gradient(75% 80% at 48% 42%, #B01205 0%, rgba(176,18,5,0) 70%),
                        linear-gradient(180deg, #D8470A 0%, #C0300A 28%, #B01205 46%, #7A1C08 68%, #2A1108 88%, #180D08 100%)
                    `,
                }}
            >
                <div ref={heroTextRef} className='w-full h-fit flex justify-between max-[1025px]:flex-col max-[1025px]:gap-8'>
                    <div className=' w-[45%] leading-30! max-[1025px]:w-[62%] max-md:w-full'>
                    <OverflowTextReveal stagger={0.015} start={startH1}>
                    <h1 className='text-[7.5vw] max-[1025px]:text-[12vw]  max-md:text-[15vw] leading-[1.1]!'>
                        Visualise
                        Your Mind
                        in Motion
                    </h1>
                    </OverflowTextReveal>

                    </div>
                    <div className='w-[10%] flex flex-col justify-between text-end text-[1.25vw] leading-[1.15] py-[2vw] max-[1025px]:w-[40%] max-[1025px]:text-[3.5vw] max-[1025px]:text-start max-[1025px]:flex-col-reverse  max-md:text-[4.5vw] max-md:gap-[7vw] max-[1025px]:gap-20 max-md:py-0'>
                        <OverflowTextReveal splitBy='lines' start={startSideText}>
                        <p>
                            Award winning Designs
                        </p>

                        </OverflowTextReveal>
                        <OverflowTextReveal splitBy='lines' start={startSideText}>

                        <p>
                            Creative<br/>
                            Web Designer
                        </p>
                        </OverflowTextReveal>


                    </div>


                </div>
                <div ref={imgRevealRef} className='absolute bottom-[-64%] left-1/2 translate-x-[-49.5%] size-[180%] max-[1025px]:w-full max-[1025px]:translate-x-[-40%] max-md:w-[160%] max-md:top-auto max-md:bottom-[-30%] max-md:h-auto max-md:translate-x-[-40%] hero-av-img hero-mask-reveal opacity-0'>
                    <div ref={heroAvImgRef} className='w-full h-full'>
                        <Image src={elenavossHeroImg} alt='hero-img' className='w-full h-full object-contain' priority />
                    </div>
                </div>

            </div>
            <div className='absolute inset-0 w-full h-full bg-[#070707]   '>
                <div className='w-full h-screen sticky top-0 px-[4vw] flex gap-[2.5vw] overflow-hidden'>
                    <div className='w-[50%] h-fit flex flex-col gap-[2.5vw] marquee-1'>
                        {(isMobileMarquee ? MOBILE_MARQUEE_IMAGES : DESKTOP_MARQUEE_1).map((img, i) => (
                            <div key={i} className='w-full h-[27vw] max-[1025px]:h-[45vw] max-md:h-[55vw] overflow-hidden'>
                                <Image src={img} alt='portfolio-img' width={700} height={500} className='w-full h-full overflow-hidden object-cover' />
                            </div>
                        ))}
                    </div>
                    <div className='w-[50%] h-fit flex flex-col gap-[2.5vw] marquee-2'>
                        {(isMobileMarquee ? MOBILE_MARQUEE_IMAGES : DESKTOP_MARQUEE_2).map((img, i) => (
                            <div key={i} className='w-full h-[27vw] max-[1025px]:h-[45vw] max-md:h-[55vw] overflow-hidden'>
                                <Image src={img} alt='portfolio-img' width={700} height={500} className='w-full h-full overflow-hidden object-cover' />
                            </div>
                        ))}
                    </div>
                </div>

            </div>

        </section>
    )
}

export default Hero