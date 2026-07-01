'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'
import { Eye, Download, Sliders, Rocket } from 'lucide-react'

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger)
}

const STEPS = [
    {
        num: '01',
        title: 'Preview',
        text: 'Use the Hyperiux CLI to add only the effect you need. Vault adds only the files that effect needs, not a full interaction circus. You can inspect and own the implementation.',
        Icon: Eye,
    },
    {
        num: '02',
        title: 'Install',
        text: 'Use the Hyperiux CLI to add only the effect you need. Vault adds only the files that effect needs, not a full interaction circus. You can inspect and own the implementation.',
        Icon: Download,
    },
    {
        num: '03',
        title: 'Tune',
        text: 'Easily modify timing, colors, and properties. Tweak the animation to seamlessly match your unique brand identity and product feel.',
        Icon: Sliders,
    },
    {
        num: '04',
        title: 'Ship',
        text: 'Deploy a website that feels sharper, more responsive, and more memorable, without rebuilding every interaction from scratch.',
        Icon: Rocket,
    },
]

/* ── Shared animation config ── */
const ACTIVE_BG = '#ffffff'
const ACTIVE_COLOR = '#161616'
const INACTIVE_BG = '#161616'
const INACTIVE_COLOR = '#ffffff'
const OPEN_HEIGHT = '16vw'
const CLOSED_HEIGHT = '5vw'
const EASE = 'power1.inOut'
const STEP_DURATION = 1.8
const HOLD_DURATION = 1.2

export default function Workflow() {
    const containerRef = useRef(null)
    const accordionRef = useRef(null)
    const videoRef = useRef(null)
    const videoSectionRef = useRef(null)

    useEffect(() => {
        const ctx = gsap.context(() => {
            /* ── Query DOM groups ── */
            const numBoxes = gsap.utils.toArray('.wf-num-box')
            const contentBoxes = gsap.utils.toArray('.wf-content-box')
            const nums = gsap.utils.toArray('.wf-num')
            const icons = gsap.utils.toArray('.wf-icon')
            const texts = gsap.utils.toArray('.wf-text')
            const lineFills = gsap.utils.toArray('.wf-line-fill')

            /* ── Helper: set a step to its closed state ── */
            const setInactive = (i) => {
                gsap.set(contentBoxes[i], { height: CLOSED_HEIGHT, backgroundColor: INACTIVE_BG, color: INACTIVE_COLOR })
                gsap.set(numBoxes[i], { backgroundColor: INACTIVE_BG, color: INACTIVE_COLOR })
                gsap.set(nums[i], { autoAlpha: 1, scale: 1 })
                gsap.set(icons[i], { autoAlpha: 0, scale: 0.6 })
                gsap.set(texts[i], { autoAlpha: 0 })
            }

            /* ── Helper: set a step to its open state ── */
            const setActive = (i) => {
                gsap.set(contentBoxes[i], { height: OPEN_HEIGHT, backgroundColor: ACTIVE_BG, color: ACTIVE_COLOR })
                gsap.set(numBoxes[i], { backgroundColor: ACTIVE_BG, color: ACTIVE_COLOR })
                gsap.set(nums[i], { autoAlpha: 0, scale: 0.6 })
                gsap.set(icons[i], { autoAlpha: 1, scale: 1 })
                gsap.set(texts[i], { autoAlpha: 1 })
            }

            /* ── Initial state: first open, rest closed ── */
            STEPS.forEach((_, i) => (i === 0 ? setActive(i) : setInactive(i)))
            gsap.set(lineFills, { scaleY: 0, transformOrigin: 'top center' })

            /* ── Main scrub timeline ── */
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: accordionRef.current,
                    start: 'top top',
                    end: 'bottom bottom',
                    scrub: 2,
                    invalidateOnRefresh: true,
                },
            })

            /* ── Radial glow (runs across the whole timeline) ── */
            gsap.set('.radial-glow', { opacity: 0.2, scale: 0.8, transformOrigin: 'bottom center' })
            tl.to('.radial-glow', { opacity: 0.8, scale: 1.5, ease: 'none', duration: STEPS.length * (STEP_DURATION + HOLD_DURATION) }, 0)

            /* ── Build the accordion sequence ── */
            const SEGMENT = STEP_DURATION + HOLD_DURATION

            STEPS.forEach((_, i) => {
                const segmentStart = i * SEGMENT

                if (i === 0) {
                    /* Step 0 is already open — just fill the first connecting line */
                    if (lineFills[0]) {
                        tl.to(lineFills[0], { scaleY: 1, ease: 'none', duration: HOLD_DURATION }, segmentStart + STEP_DURATION)
                    }
                    tl.to({}, { duration: SEGMENT }, segmentStart)
                    return
                }

                const t = segmentStart

                /* Close previous step — fade text out early to avoid squish glitch */
                tl.to(texts[i - 1], { autoAlpha: 0, duration: STEP_DURATION * 0.35, ease: 'power2.in' }, t)
                tl.to(contentBoxes[i - 1], { height: CLOSED_HEIGHT, backgroundColor: INACTIVE_BG, color: INACTIVE_COLOR, duration: STEP_DURATION, ease: EASE }, t)
                tl.to(numBoxes[i - 1], { backgroundColor: INACTIVE_BG, color: INACTIVE_COLOR, duration: STEP_DURATION, ease: EASE }, t)
                tl.to(nums[i - 1], { autoAlpha: 1, scale: 1, duration: STEP_DURATION, ease: EASE }, t)
                tl.to(icons[i - 1], { autoAlpha: 0, scale: 0.6, duration: STEP_DURATION, ease: EASE }, t)

                /* Open current step — expand first, then fade text in late */
                tl.to(contentBoxes[i], { height: OPEN_HEIGHT, backgroundColor: ACTIVE_BG, color: ACTIVE_COLOR, duration: STEP_DURATION, ease: EASE }, t)
                tl.to(numBoxes[i], { backgroundColor: ACTIVE_BG, color: ACTIVE_COLOR, duration: STEP_DURATION, ease: EASE }, t)
                tl.to(nums[i], { autoAlpha: 0, scale: 0.6, duration: STEP_DURATION, ease: EASE }, t)
                tl.to(icons[i], { autoAlpha: 1, scale: 1, duration: STEP_DURATION, ease: EASE }, t)
                tl.to(texts[i], { autoAlpha: 1, duration: STEP_DURATION * 0.5, ease: 'power2.out' }, t + STEP_DURATION * 0.5)

                /* Hold & fill the connecting line to the next step */
                if (lineFills[i]) {
                    tl.to(lineFills[i], { scaleY: 1, ease: 'none', duration: HOLD_DURATION }, t + STEP_DURATION)
                }
            })

            /* ── Video reveal ── */
            gsap.fromTo(
                videoRef.current,
                { clipPath: 'inset(15% 15% 15% 15%)', backgroundColor: '#0A1B4B' },
                {
                    clipPath: 'inset(0% 0% 0% 0%)',
                    backgroundColor: '#ffffff',
                    ease: 'none',
                    scrollTrigger: {
                        trigger: videoSectionRef.current,
                        start: 'top 80%',
                        end: '50% 50%',
                        scrub: true,
                    },
                }
            )
        }, containerRef)

        return () => ctx.revert()
    }, [])

    return (
        <div ref={containerRef} className="text-white">
            {/* ── Accordion Section ── */}
            <section
                ref={accordionRef}
                id="Workflow"
                className="h-[400vh] relative"
            >
                <h2 className="text-[5.5vw] w-[70%] pt-[10vw] text-center mx-auto mb-[6vw] relative z-20">
                    Preview. Install. Tune <span className="text-primary">Ship.</span>
                </h2>

                <div className="h-screen w-full sticky top-0 flex flex-col justify-center max-md:pt-[30vw]">
                    <div className="w-full h-full relative z-10">
                        {/* Radial glow */}
                        <div
                            className="radial-glow w-[100vw] h-[50vw] absolute bottom-[-15vw] left-1/2 rounded-full -translate-x-1/2 pointer-events-none z-0"
                            style={{ background: 'radial-gradient(50% 50% at 50% 50%, #ff5f00 0%, transparent 100%)' }}
                        />

                        {/* Steps */}
                        <div className="h-full w-full flex-col gap-0 flex items-center justify-center relative z-100">
                            {STEPS.map((step, idx) => (
                                <div key={idx} className="flex items-stretch w-[52vw]">
                                    {/* Left column: number box + connecting line */}
                                    <div className="flex flex-col items-center w-[5vw] shrink-0">
                                        {/* Number / Icon box */}
                                        <div className="wf-num-box h-[5vw] w-[5vw] aspect-square flex items-center justify-center rounded-sm bg-dark-card relative overflow-hidden shrink-0">
                                            <div className="wf-num absolute inset-0 flex items-center justify-center">
                                                <p className="text34 pr-[.2vw]">{step.num}</p>
                                            </div>
                                            <div className="wf-icon absolute inset-0 flex items-center justify-center">
                                                <step.Icon className="w-[2.5vw] h-[2.5vw]" />
                                            </div>
                                        </div>

                                        {/* Connecting line (not rendered after the last step) */}
                                        {idx < STEPS.length - 1 && (
                                            <div className="flex-1 w-[3px] bg-white/10 relative my-0">
                                                <div className="wf-line-fill absolute inset-0 bg-white/70" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Right column: content box */}
                                    <div className="flex flex-col ml-[1vw] flex-1 mb-[1.5vw]">
                                        <div className="wf-content-box h-[5vw] flex-col flex justify-between w-full text34 rounded-sm px-[2vw] py-[1.4vw] bg-dark-card overflow-hidden">
                                            <p className="leading-none mt-[.25vw]">{step.title}</p>
                                            <div className="wf-text w-[85%] overflow-hidden opacity-0">
                                                <p className="text24 pt-[1.5vw] leading-[1.3]">{step.text}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Video Section ── */}
            <section ref={videoSectionRef} className="w-full flex items-center justify-center py-[10vw]">
                <div ref={videoRef} className="w-[100vw] h-auto max-md:p-[4vw] max-md:h-[35vh] overflow-hidden bg-primary rounded-md">
                    <video
                        src="/video/tutorial.mp4"
                        autoPlay
                        loop
                        muted
                        preload="auto"
                        playsInline
                        className="w-full h-full object-cover rounded-sm"
                    />
                </div>
            </section>
        </div>
    )
}
