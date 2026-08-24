"use client"
import Image from 'next/image'
import elenavossHeroImg from './assets/hero-bg-full-img.png'
import portfolio1Img from './assets/hero-portfolio-1.png'
import portfolio3Img from './assets/hero-portfolio-3.png'
import portfolio2Img from './assets/hero-portfolio-2.png'
import portfolio4Img from './assets/hero-portfolio-4.png'
import { useCallback, useEffect, useRef, useState } from 'react'
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

// How many seconds BEFORE the h1's text reveal visually finishes the image
// wipe (and, chained after it, the header) starts - creates the overlap.
// 0 = old behavior (image waits for text to fully finish). Raise this to
// start the image earlier/more overlapped; it's capped implicitly by the
// text reveal's own total duration (delay + stagger*(charCount-1) +
// duration, which for this h1 is well under 1s) - going past that just
// fires as soon as possible, i.e. right alongside the text. 2s safely
// clears that ceiling without the value looking like a typo.
const TEXT_IMAGE_OVERLAP = 2

// The image wipe now runs on roughly the same timescale as the h1's own
// stagger reveal instead of the old 4.5s - at 4.5s, even starting exactly
// alongside the text (which TEXT_IMAGE_OVERLAP already guaranteed), the
// slow power3.inOut ramp-up meant almost no visible movement for the
// first second, which read as "delayed" even though the tween had
// technically already started. A shorter duration + a fast-starting ease
// makes the wipe visibly moving from frame one.
const IMAGE_REVEAL_DURATION = 2.5

// Cursor parallax: the portrait (closer/bigger, reads as "foreground")
// drifts further than the text (reads as "further back"), same direction,
// both lerped toward the cursor's normalized -1..1 position for a smooth
// catch-up rather than snapping straight to it.
const IMAGE_PARALLAX_MAX_X = 30
const TEXT_PARALLAX_MAX_X = 12
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
    const heroAvImgRef = useRef<HTMLDivElement | null>(null)
    const heroTextRef = useRef<HTMLDivElement | null>(null)
    const imgRevealRef = useRef<HTMLDivElement | null>(null)
    const introPlayedRef = useRef(false)
    const [isMobileMarquee, setIsMobileMarquee] = useState(false)
    const lenis = useLenis()
    // useLenis() returns undefined for the first render or two, then the
    // real instance - read through a ref so handleTextRevealComplete's
    // identity never changes. It's passed as OverflowTextReveal's onComplete
    // prop, which sits in that component's own effect dependency array;
    // a changing reference there tore down and rebuilt the SplitText
    // char-reveal mid-animation (the reported "glitch" on reload).
    const lenisRef = useRef(lenis)
    useEffect(() => {
        lenisRef.current = lenis
    }, [lenis])

    useEffect(() => {
        const mq = window.matchMedia(MOBILE_MARQUEE_QUERY)
        const update = () => setIsMobileMarquee(mq.matches)
        update()
        mq.addEventListener('change', update)
        return () => mq.removeEventListener('change', update)
    }, [])

    // Intro sequence: text (handled by OverflowTextReveal itself) -> image
    // unmask -> header slide-in. Image/header are hidden via a static
    // opacity-0 class in the JSX itself (not a gsap.set effect) so they're
    // already invisible in the server-rendered HTML, before hydration ever
    // runs - a useEffect-driven hide would still let the pre-hydration
    // paint flash them visible for a frame. handleTextRevealComplete's own
    // fromTo() calls set the precise from-state the instant the sequence
    // starts. Scroll stays locked for the whole sequence.
    useEffect(() => {
        lenis?.stop()
    }, [lenis])

    // Targets are resolved to real elements (not string selectors) because
    // this runs as a tween-completion callback originating from inside
    // OverflowTextReveal's gsap.context(fn, containerRef) - GSAP scopes
    // selector-text resolution to that container while the context is
    // active, so '#header' would silently fail to match.
    const handleTextRevealComplete = useCallback(() => {
        if (introPlayedRef.current) return
        introPlayedRef.current = true

        const headerEl = document.getElementById('header')
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
            .fromTo(headerEl,
                { yPercent: -50, opacity: 0 },
                {
                    yPercent: 0,
                    opacity: 1,
                    duration: 0.8,
                    ease: 'power3.out',
                    onComplete: () => lenisRef.current?.start(),
                },
                0.6
            )
    }, [])

    useEffect(()=>{
        // if(globalThis.innerWidth>1024){
            gsap.to(".hero-container",{
               scale:0.5,
               ease:"power2.inOut",
               scrollTrigger:{
                   trigger:"#hero",
                   start:"top top",
                   end:"bottom bottom",
                   scrub:true,
                   // markers:true
               }
            })
        // }
    })

    useEffect(() => {
        if (globalThis.innerWidth <= 1024) return
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

        const state = { targetImgX: 0, currentImgX: 0, targetTextX: 0, currentTextX: 0 }

        const handleMouseMove = (e: MouseEvent) => {
            const normalizedX = (e.clientX / window.innerWidth) * 2 - 1 // -1..1
            state.targetImgX = normalizedX * IMAGE_PARALLAX_MAX_X
            state.targetTextX = normalizedX * TEXT_PARALLAX_MAX_X
        }
        window.addEventListener('mousemove', handleMouseMove)

        let frameId: number
        const tick = () => {
            state.currentImgX += (state.targetImgX - state.currentImgX) * PARALLAX_LERP
            state.currentTextX += (state.targetTextX - state.currentTextX) * PARALLAX_LERP
            gsap.set(heroAvImgRef.current, { x: state.currentImgX })
            gsap.set(heroTextRef.current, { x: state.currentTextX })
            frameId = requestAnimationFrame(tick)
        }
        frameId = requestAnimationFrame(tick)

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            cancelAnimationFrame(frameId)
        }
    }, [])
    return (
        <section className="relative w-screen h-[300vh]" id='hero'>
            <div
                className="w-screen h-screen sticky top-0 flex justify-between items-center hero-container px-[4vw] z-2  max-[1025px]:items-start max-[1025px]:pt-[40vw] overflow-hidden"
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
                <div ref={heroTextRef} className='w-full h-fit flex justify-between max-[1025px]:flex-col max-md:gap-8'>
                    <div className=' w-[45%] leading-30! max-[1025px]:w-[62%] max-md:w-full'>
                    <OverflowTextReveal stagger={0.015} onComplete={handleTextRevealComplete} completeOverlap={TEXT_IMAGE_OVERLAP}>
                    <h1 className='text-[7.5vw] max-[1025px]:text-[10vw]  max-md:text-[15vw] leading-[1.1]!'>
                        Visualise
                        Your Mind
                        in Motion
                    </h1>
                    </OverflowTextReveal>

                    </div>
                    <div className='w-[10%] flex flex-col justify-between text-end text-[1.25vw] leading-[1.15] py-[2vw] max-[1025px]:w-[40%] max-[1025px]:text-[2.5vw] max-[1025px]:text-start max-[1025px]:flex-col-reverse  max-md:text-[4.5vw] max-md:gap-[7vw] max-[1025px]:gap-6 max-md:py-0'>
                        <OverflowTextReveal splitBy='lines'>
                        <p>
                            Award winning Designs
                        </p>

                        </OverflowTextReveal>
                        <OverflowTextReveal splitBy='lines'>

                        <p>
                            Creative<br/>
                            Web Designer
                        </p>
                        </OverflowTextReveal>


                    </div>


                </div>
                <div ref={imgRevealRef} className='absolute bottom-[-64%] left-1/2 translate-x-[-48.5%] size-[180%] max-[1025px]:w-[90%] max-md:w-[160%] max-md:top-auto max-md:bottom-[-20%] max-md:h-auto max-md:translate-x-[-40%] hero-av-img hero-mask-reveal opacity-0'>
                    <div ref={heroAvImgRef} className='w-full h-full'>
                        <Image src={elenavossHeroImg} alt='hero-img' className='w-full h-full object-contain' />
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