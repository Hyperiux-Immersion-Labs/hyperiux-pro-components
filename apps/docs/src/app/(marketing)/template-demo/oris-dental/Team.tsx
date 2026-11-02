'use client'

import Image, { StaticImageData } from 'next/image'
import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/dist/ScrollTrigger'
import { useLenis } from 'lenis/react'
import { CalendarPlus } from 'lucide-react'
import SplitTextLines from './effects/split-text-lines/SplitTextLines'
import { BOOK_DOCTOR_EVENT, type BookDoctorDetail } from './booking'
import elenaMarsh from './assets/team/elena-marsh.webp'
import jamesOkafor from './assets/team/james-okafor.webp'
import priyaRaman from './assets/team/priya-raman.webp'
import lucasBennett from './assets/team/lucas-bennett.webp'

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger)
}

interface TeamMember {
    id: number
    src: StaticImageData | string
    name: string
    role: string
    experience: string
}

const TEAM: TeamMember[] = [
    { id: 1, src: elenaMarsh, name: 'Dr. Elena Marsh', role: 'Founder & Lead Dentist', experience: '18 yrs experience' },
    { id: 2, src: jamesOkafor, name: 'Dr. James Okafor', role: 'Implant Specialist', experience: '14 yrs experience' },
    { id: 3, src: priyaRaman, name: 'Dr. Priya Raman', role: 'Orthodontist', experience: '9 yrs experience' },
    { id: 4, src: lucasBennett, name: 'Dr. Lucas Bennett', role: 'Pediatric Dentist', experience: '11 yrs experience' },
]

const HEADING = 'Meet Our Team'
const SUBHEADING =
    'Experienced specialists who pair clinical skill with a gentle, patient-first approach to every visit.'

/** Photo card with a floating white panel (name, role, booking button) inset at the bottom. */
function TeamCard({ member, className = '', sizes }: { member: TeamMember; className?: string; sizes: string }) {
    const lenis = useLenis()

    // Pre-fills the booking form with this doctor, then scrolls to it.
    const book = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault()
        window.dispatchEvent(new CustomEvent<BookDoctorDetail>(BOOK_DOCTOR_EVENT, { detail: { name: member.name } }))
        if (lenis) lenis.scrollTo('#oris-form')
        else document.getElementById('oris-form')?.scrollIntoView({ behavior: 'smooth' })
    }

    return (
        <div
            className={`group relative aspect-[0.94] rounded-[1vw] max-lg:rounded-2xl overflow-hidden bg-[#e9ebee] will-change-transform ${className}`}
        >
            <Image
                src={member.src}
                alt={`${member.name}, ${member.role}`}
                fill
                sizes={sizes}
                className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-black/10 pointer-events-none" />
            <span className="absolute top-[5%] left-[5%] rounded-full bg-[#3365e2] px-[0.9vw] py-[0.4vw] max-lg:px-3 max-lg:py-1.5 text-[0.85vw] max-lg:text-xs font-medium leading-none text-white">
                {member.experience}
            </span>
            <div className="absolute inset-x-[5%] bottom-[5%] flex items-center justify-between gap-[0.8vw] max-lg:gap-2 rounded-[0.7vw] max-lg:rounded-xl bg-white px-[1.2vw] py-[1vw] max-lg:px-4 max-lg:py-3">
                <div className="min-w-0">
                    <h3 className="text-[1.2vw] max-lg:text-lg leading-tight text-oris-secondary">{member.name}</h3>
                    <p className="mt-[0.3vw] max-lg:mt-1 text-[0.9vw] max-lg:text-sm leading-tight text-[#13314a]/60">
                        {member.role}
                    </p>
                </div>
                <a
                    href="#oris-form"
                    onClick={book}
                    aria-label={`Book an appointment with ${member.name}`}
                    className="group/book relative flex shrink-0 items-center justify-center size-[2.6vw] max-lg:size-10 rounded-full bg-[#3365e2] text-white shadow-[0_4px_14px_rgba(51,101,226,0.35)] transition-[background-color,transform] duration-300 hover:bg-[#2853be] hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3365e2] active:scale-95"
                >
                    <CalendarPlus className="size-[1.05vw] max-lg:size-[18px]" strokeWidth={1.8} aria-hidden="true" />
                    <span
                        aria-hidden="true"
                        className="pointer-events-none absolute bottom-full right-0 mb-[0.6vw] whitespace-nowrap rounded-md bg-[#13314a] px-[0.6vw] py-[0.35vw] text-[0.8vw] leading-none text-white opacity-0 translate-y-1 transition-all duration-300 group-hover/book:opacity-100 group-hover/book:translate-y-0 max-lg:hidden"
                    >
                        Book a visit
                    </span>
                </a>
            </div>
        </div>
    )
}

export default function Team() {
    const sectionRef = useRef<HTMLElement | null>(null)
    const runwayRef = useRef<HTMLDivElement | null>(null)
    const mobileGridRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        const ctx = gsap.context(() => {
            const mm = gsap.matchMedia(sectionRef)

            // Desktop: the middle cards rise into view, then the outer two slide out from behind them.
            mm.add('(min-width: 1025px)', () => {
                const runway = runwayRef.current
                if (!runway) return

                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: runway,
                        start: '-15% top',
                        end: '105% bottom',
                        scrub: true,
                        invalidateOnRefresh: true,
                    },
                })

                gsap.set('.team-card-2, .team-card-3', { y: () => window.innerHeight * 1.05 })
                gsap.set('.team-card-1', { y: () => window.innerHeight * 1.05, xPercent: 110 })
                gsap.set('.team-card-4', { y: () => window.innerHeight * 1.05, xPercent: -110 })

                tl.to(['.team-card-2', '.team-card-3', '.team-card-1', '.team-card-4'], { y: 0, ease: 'power1.out', duration: 1 }, 0)
                tl.to('.team-card-1', { xPercent: 0, ease: 'power2.inOut', duration: 1.2 }, 0.6)
                tl.to('.team-card-4', { xPercent: 0, ease: 'power2.inOut', duration: 1.2 }, 0.6)
                // Hold beat before scrolling away
                tl.to({}, { duration: 0.6 })
            })

            // Tablet & mobile: the cards fade up as the grid scrolls in.
            mm.add('(max-width: 1024px)', () => {
                if (!mobileGridRef.current) return
                const cards = mobileGridRef.current.querySelectorAll('.team-grid-card')
                gsap.set(cards, { y: 50, opacity: 0 })
                gsap.to(cards, {
                    y: 0,
                    opacity: 1,
                    duration: 1,
                    stagger: 0.08,
                    ease: 'power2.out',
                    scrollTrigger: { trigger: mobileGridRef.current, start: 'top 80%', once: true },
                })
            })
        }, sectionRef)

        return () => ctx.revert()
    }, [])

    return (
        <section id="our-team" ref={sectionRef} className="w-full bg-white relative z-10 text-oris-secondary">
            {/* Desktop: sticky stage the cards animate into */}
            <div ref={runwayRef} className="w-full h-[220vh] max-lg:hidden relative">
                <div className="sticky top-0 h-screen w-full flex flex-col justify-center items-center oris-paddx overflow-hidden">
                    <div className="flex flex-col items-center text-center mx-auto mb-[3.5vw]">
                        <SplitTextLines as="h2" className="text-[4.2vw] font-normal leading-[1.15]">
                            {HEADING}
                        </SplitTextLines>
                        <SplitTextLines as="p" className="oris-text22 text-oris-secondary/80 mt-[1.2vw] max-w-[38vw]" delay={0.15}>
                            {SUBHEADING}
                        </SplitTextLines>
                    </div>
                    <div className="flex items-center justify-center gap-[2.2vw] w-full max-w-[94vw] relative">
                        <TeamCard member={TEAM[0]} sizes="25vw" className="team-card-1 w-[21.5vw] z-10" />
                        <TeamCard member={TEAM[1]} sizes="25vw" className="team-card-2 w-[21.5vw] z-20" />
                        <TeamCard member={TEAM[2]} sizes="25vw" className="team-card-3 w-[21.5vw] z-20" />
                        <TeamCard member={TEAM[3]} sizes="25vw" className="team-card-4 w-[21.5vw] z-10" />
                    </div>
                </div>
            </div>

            {/* Tablet & mobile: a plain grid */}
            <div className="hidden max-lg:flex max-lg:flex-col max-lg:items-center max-lg:gap-10 oris-paddx py-20 max-md:py-14">
                <div className="flex flex-col items-center text-center mx-auto">
                    <h2 className="text-[6vw] max-md:text-[7.5vw] font-normal leading-[1.15]">{HEADING}</h2>
                    <p className="oris-text22 text-oris-secondary/80 mt-3 max-w-xl">{SUBHEADING}</p>
                </div>
                <div ref={mobileGridRef} className="grid grid-cols-2 max-sm:grid-cols-1 gap-3 w-full max-w-2xl">
                    {TEAM.map((member) => (
                        <TeamCard
                            key={member.id}
                            member={member}
                            sizes="(max-width: 640px) 100vw, 50vw"
                            className="team-grid-card w-full"
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}
