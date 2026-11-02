'use client'

import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/dist/ScrollTrigger'
import { useLenis } from 'lenis/react'
import { CalendarDays, ClipboardList, PhoneCall, Stethoscope, type LucideIcon } from 'lucide-react'
import SplitTextLines from './effects/split-text-lines/SplitTextLines'
import DotFillBtn from './effects/dot-fill-btn/DotFillBtn'
import DotsCanvas from './teeth-3d/DotsCanvas'

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger)
}

interface Step {
    icon: LucideIcon
    title: string
    description: string
}

const STEPS: Step[] = [
    {
        icon: Stethoscope,
        title: 'Choose a\ntreatment',
        description: "Pick the care you need, or a general consultation if you're unsure.",
    },
    {
        icon: CalendarDays,
        title: 'Pick a date\nand time',
        description: 'Choose a slot that suits you, including same-day emergency slots.',
    },
    {
        icon: ClipboardList,
        title: 'Share your\ndetails',
        description: 'Leave your name, phone number and a short note about your concern.',
    },
    {
        icon: PhoneCall,
        title: 'Get a\nconfirmation call',
        description: 'Our care coordinator calls you within 15 minutes to confirm your visit.',
    },
]

const HEADING = 'Book Your Visit in Four Easy Steps'
const SUBHEADING =
    'From choosing a treatment to a confirmation call, booking with Oris Dental is quick, simple and stress-free.'

export default function BookingFlow() {
    const sectionRef = useRef<HTMLElement | null>(null)
    const trackRef = useRef<HTMLOListElement | null>(null)
    const fillRef = useRef<HTMLSpanElement | null>(null)
    const lenis = useLenis()

    useEffect(() => {
        const ctx = gsap.context(() => {
            const cards = gsap.utils.toArray<HTMLElement>('.step-card')
            const nodes = gsap.utils.toArray<HTMLElement>('.step-node')
            gsap.set(cards, { y: 50, opacity: 0 })
            gsap.to(cards, {
                y: 0,
                opacity: 1,
                duration: 1,
                stagger: 0.12,
                ease: 'power2.out',
                scrollTrigger: { trigger: trackRef.current, start: 'top 80%', once: true },
            })

            const mm = gsap.matchMedia()
            // Desktop: the connecting line fills left to right and lights up each step as it passes.
            mm.add('(min-width: 1025px)', () => {
                gsap.fromTo(
                    fillRef.current,
                    { scaleX: 0 },
                    {
                        scaleX: 1,
                        ease: 'none',
                        scrollTrigger: {
                            trigger: trackRef.current,
                            start: 'top 75%',
                            end: 'top 30%',
                            scrub: true,
                            onUpdate: (self) => {
                                nodes.forEach((node, i) => {
                                    node.dataset.active = String(self.progress >= i / (nodes.length - 1) - 0.001)
                                })
                            },
                        },
                    }
                )
            })
            // Below desktop the steps stack, so each one lights up as it scrolls into view.
            mm.add('(max-width: 1024px)', () => {
                nodes.forEach((node) => {
                    ScrollTrigger.create({
                        trigger: node,
                        start: 'top 75%',
                        onEnter: () => (node.dataset.active = 'true'),
                        onLeaveBack: () => (node.dataset.active = 'false'),
                    })
                })
            })
        }, sectionRef)
        return () => ctx.revert()
    }, [])

    return (
        <section
            id="booking-flow"
            ref={sectionRef}
            className="w-full bg-white relative z-10 text-oris-secondary oris-paddx py-[7vw] max-md:py-16"
        >
            {/* Same heading block as the treatments section: heading with the paragraph directly below. */}
            <div className="mb-[7vw] max-lg:mb-[10vw] max-md:mb-[12vw]">
                <SplitTextLines as="h2" className="text-[4.2vw] max-lg:text-[6vw] max-md:text-[7.5vw]">
                    {HEADING}
                </SplitTextLines>
                <SplitTextLines as="p" className="oris-text22 mt-[1.5vw]" delay={0.15}>
                    {SUBHEADING}
                </SplitTextLines>
            </div>

            <ol ref={trackRef} className="relative grid grid-cols-4 gap-[1.6vw] max-lg:grid-cols-1 max-lg:gap-5">
                {/* Desktop connector: runs from the first step marker to the last. */}
                <span
                    aria-hidden="true"
                    className="absolute top-[1.3vw] left-[1.3vw] right-[calc((100%-4.8vw)/4-1.3vw)] h-[2px] -translate-y-1/2 bg-[#3365e2]/15 max-lg:hidden"
                >
                    <span ref={fillRef} className="absolute inset-0 origin-left scale-x-0 bg-[#3365e2]" />
                </span>

                {STEPS.map((step, i) => {
                    const Icon = step.icon
                    const highlight = i === STEPS.length - 1
                    return (
                        <li key={step.title} className="relative flex flex-col gap-[1.4vw] max-lg:flex-row max-lg:gap-4">
                            {/* Stacked layouts: vertical connector down to the next step. */}
                            {!highlight && (
                                <span
                                    aria-hidden="true"
                                    className="hidden max-lg:block absolute left-5 top-10 -bottom-5 w-[2px] -translate-x-1/2 bg-[#3365e2]/15"
                                />
                            )}
                            <span
                                data-active="false"
                                className="step-node relative z-10 flex shrink-0 items-center justify-center size-[2.6vw] max-lg:size-10 rounded-full border border-[#3365e2]/30 bg-white text-[0.85vw] max-lg:text-sm text-[#3365e2] transition-colors duration-500 data-[active=true]:border-[#3365e2] data-[active=true]:bg-[#3365e2] data-[active=true]:text-white"
                            >
                                {String(i + 1).padStart(2, '0')}
                            </span>
                            <div
                                className={`step-card relative flex-1 overflow-hidden rounded-xl max-md:rounded-3xl p-[2vw] max-lg:p-6 min-h-[18vw] max-lg:min-h-0 flex flex-col justify-between gap-[2.4vw] max-lg:gap-8 will-change-transform ${
                                    highlight ? 'bg-[#3365e2] text-white' : 'bg-[#f4f6fc]'
                                }`}
                            >
                                {highlight && (
                                    <DotsCanvas
                                        spacing={20}
                                        baseRadius={1.2}
                                        maxRadius={4}
                                        interactionRadius={280}
                                        baseOpacity={0}
                                        maxOpacity={0.75}
                                        gradient={false}
                                        lerpFactor={0.22}
                                    />
                                )}
                                <Icon
                                    className={`relative z-10 size-[2vw] max-lg:size-7 ${highlight ? 'text-white' : 'text-[#3365e2]'}`}
                                    strokeWidth={1.4}
                                    aria-hidden="true"
                                />
                                <div className="relative z-10">
                                    <h3
                                        className={`text-[1.75vw] max-lg:text-[4vw] max-md:text-[6.4vw] leading-[1.15] whitespace-pre-line tracking-tight ${
                                            highlight ? 'text-white' : 'text-[#13314a]'
                                        }`}
                                    >
                                        {step.title}
                                    </h3>
                                    <p
                                        className={`oris-text22 leading-[1.4] text-pretty mt-[0.9vw] max-lg:mt-3 ${
                                            highlight ? 'text-white/80' : 'text-[#13314a]/60'
                                        }`}
                                    >
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        </li>
                    )
                })}
            </ol>

            <div className="mt-[3.5vw] max-lg:mt-10 flex justify-center">
                <DotFillBtn
                    btnText="Book Appointment"
                    href="#oris-form"
                    onClick={(event) => {
                        if (!lenis) return
                        event.preventDefault()
                        lenis.scrollTo('#oris-form')
                    }}
                    bgColor="#3365e2"
                    textColor="#ffffff"
                    hoverTextColor="#3365e2"
                    dotColor="#ffffff"
                    className="border border-[#3365e2]"
                    textClassName="text-[1vw] max-md:text-sm max-lg:text-xl font-medium"
                />
            </div>
        </section>
    )
}
