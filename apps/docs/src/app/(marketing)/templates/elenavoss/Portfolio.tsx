"use client"
import { useEffect, useRef } from 'react'
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
// shrinks, and it eases back up to the wide, shallow resting rx once
// scrolling stops.
const CURVE_IDLE_RX = 120
const CURVE_ACTIVE_RX = 58
// How strongly scroll speed pulls rx toward CURVE_ACTIVE_RX - scroll
// velocity (px/s) beyond this is treated as "fully intense."
const CURVE_VELOCITY_CAP = 2200

const Portfolio = () => {
    const dotRefs = useRef<(HTMLSpanElement | null)[]>([])
    const lineFillRef = useRef<HTMLDivElement | null>(null)
    const cardRefs = useRef<(HTMLDivElement | null)[]>([])
    const curveRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: '#portfolio',
                start: '15% top',
                end: 'bottom bottom',
                scrub: true,
                // markers: true,
            },
        })

        gsap.set(lineFillRef.current, { scaleY: 0 })
        gsap.set(dotRefs.current[0], { backgroundColor: '#ffffff', borderColor: '#ffffff' })
        dotRefs.current.slice(1).forEach((dot) => {
            gsap.set(dot, { backgroundColor: 'transparent', borderColor: 'rgba(255,255,255,0.5)' })
        })
        gsap.set(cardRefs.current, { filter: 'brightness(1)' })
        cardRefs.current.slice(1).forEach((card) => {
            gsap.set(card, { yPercent: 100 })
        })

        gsap.to(".circle-clip",{
            yPercent:-20,
            scrollTrigger:{
                trigger: '#portfolio',
                start: 'top bottom',
                end: '20% bottom',
                scrub: true,
                // markers:true,
            }
        })

        const steps = PORTFOLIO_ITEMS.length - 1
        tl.to(lineFillRef.current, { scaleY: 1, ease: 'none', duration: steps }, 0)

        for (let i = 0; i < steps; i += 1) {
            tl.to(cardRefs.current[i + 1], { yPercent: 0, ease: 'power2.inOut', duration: 1 }, i)
            tl.to(cardRefs.current[i], { filter: 'brightness(0.75)', ease: 'power2.inOut', duration: 1 }, i)
            tl.set(dotRefs.current[i + 1], { backgroundColor: '#ffffff', borderColor: '#ffffff' }, i + 1)
        }

        // Curve reacts to real scroll speed, independent of the timeline
        // above - its own ScrollTrigger instance spanning the whole
        // document (not scoped to #portfolio's own range), purely so its
        // onUpdate gives a live velocity reading on every scroll tick.
        // getVelocity() is an instance method (scrollTrigger.getVelocity()),
        // not a static one on the ScrollTrigger class, hence needing this
        // dedicated instance rather than a plain window scroll listener.
        const curveState = { rx: CURVE_IDLE_RX }
        const applyCurve = () => {
            gsap.set(curveRef.current, { clipPath: `ellipse(${curveState.rx}% 100% at 50% 100%)` })
        }
        applyCurve()

        let idleTimer: ReturnType<typeof setTimeout> | null = null
        const velocitySt = ScrollTrigger.create({
            trigger: document.body,
            start: 0,
            end: 'max',
            onUpdate: (self) => {
                const velocity = Math.abs(self.getVelocity())
                const intensity = gsap.utils.clamp(0, 1, velocity / CURVE_VELOCITY_CAP)
                const target = gsap.utils.interpolate(CURVE_IDLE_RX, CURVE_ACTIVE_RX, intensity)

                gsap.to(curveState, {
                    rx: target,
                    duration: 0.35,
                    ease: 'power2.out',
                    overwrite: true,
                    onUpdate: applyCurve,
                })

                if (idleTimer) clearTimeout(idleTimer)
                idleTimer = setTimeout(() => {
                    gsap.to(curveState, {
                        rx: CURVE_IDLE_RX,
                        duration: 1.2,
                        ease: 'elastic.out(1, 0.55)',
                        overwrite: true,
                        onUpdate: applyCurve,
                    })
                }, 120)
            },
        })

        return () => {
            velocitySt.kill()
            if (idleTimer) clearTimeout(idleTimer)
        }
    }, [])

    return (
        <section
            className="relative w-screen h-[300vh] pt-[15vw] text-white max-[1025px]:pt-[30vw] "
            id="portfolio"
        >
            <div
                ref={curveRef}
                className='w-full h-[50vh]  absolute top-0 left-0 z-2 bg-linear-to-r from-[#F16B0D] to-[#E61416] circle-clip will-change-[clip-path]'
            />

            <div className="w-screen h-screen sticky top-0 z-3 flex flex-col items-center justify-center px-[4vw] gap-[5vw] overflow-hidden bg-linear-to-r from-[#F16B0D] to-[#E61416] max-md:gap-[8vw]">
                <OverflowTextReveal>
                <h2 className="text-[5.5vw] text-center max-[1025px]:text-[6.5vw] max-md:text-[9vw]">Award Winning Work</h2>
                </OverflowTextReveal>

                <div className="w-full flex items-center gap-[4vw] max-md:flex-col max-md:gap-[8vw]">
                    <div className="w-[32%] relative max-md:w-full">
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
                            className="absolute left-[4px] bg-white/20 top-[3.5vw] h-[21vw] max-[1025px]:h-[33vw] max-md:h-[51vw] w-px max-[1025px]:top-0"
                        />
                        <div
                            ref={lineFillRef}
                            className="absolute left-[4px] bg-white origin-top top-[3.5vw] h-[21vw] max-[1025px]:h-[33vw] max-md:h-[51vw] w-px max-[1025px]:top-0"
                        />

                        <div className="flex flex-col max-[1025px]:gap-[4vw] max-md:gap-[10vw]">
                            {PORTFOLIO_ITEMS.map((item, i) => (
                                <div
                                    key={item.name}
                                    className="relative flex items-center gap-[1.2vw] max-md:gap-[5vw]"
                                    style={{ height: `${ROW_HEIGHT_VW}vw` }}
                                >
                                    <span
                                        ref={(el) => { dotRefs.current[i] = el }}
                                        className="w-[10px] h-[10px] rounded-full border shrink-0 max-[1025px]:mt-[-7vw]"
                                    />
                                    <div>
                                        <h3 className="text-[1.5vw] font-normal max-[1025px]:text-[2.6vw] max-md:text-[5.5vw]">{item.name}</h3>
                                        <p className="text-[0.85vw] opacity-70 max-[1025px]:text-[1.8vw] max-md:text-[4.2vw]">{item.tags.join('  •  ')}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="w-[65%] h-[34vw] relative rounded-lg overflow-hidden max-md:w-full max-md:h-[75vw]">
                        {PORTFOLIO_ITEMS.map((item, i) => (
                            <div
                                key={item.name}
                                ref={(el) => { cardRefs.current[i] = el }}
                                className="absolute inset-0 bg-[#F4EFE9] flex items-center justify-center rounded-[1.5vw]"
                                style={{ zIndex: i + 1 }}
                            >
                                <Image src={item.imgSrc} alt="portfolio-img" width={800} height={400} className="w-full h-full object-cover"/>
                                
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className='absolute w-screen h-[60vh] bottom-[-15%] left-0 overflow-hidden max-[1025px]:bottom-[-13%]'>
            <div className='w-[115%] h-[40vh]  absolute bottom-[35%] left-[-7.5%] z-2 bg-linear-to-r from-[#F16B0D] to-[#E61416] blur-2xl max-[1025px]:bottom-[50%] max-[1025px]:w-[120%] max-[1025px]:left-[-10%] max-[1025px]:blur-lg'/>

            </div>


        </section>
    )
}

export default Portfolio
