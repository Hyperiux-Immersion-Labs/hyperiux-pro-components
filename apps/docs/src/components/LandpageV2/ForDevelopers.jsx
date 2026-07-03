'use client'

import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'
import { SplitText } from 'gsap/dist/SplitText'
import Link from 'next/link'
import MaskTextReveal from '../mask-text-reveal'

function AnimatedLink({ href, children, className = "" }) {
    const underlineRef = useRef(null);
    const isAnimating = useRef(false);

    const handleMouseEnter = () => {
        if (isAnimating.current) return;
        isAnimating.current = true;
        const el = underlineRef.current;
        if (!el) return;
        gsap.timeline({ onComplete: () => { isAnimating.current = false; } })
            .to(el, { scaleX: 0, transformOrigin: "right center", duration: 0.3, ease: "power2.in" })
            .to(el, { scaleX: 1, transformOrigin: "left center", duration: 0.3, ease: "power2.out" });
    };

    return (
        <Link href={href} className={`relative w-fit inline-block text-black group ${className}`} onMouseEnter={handleMouseEnter}>
            <div className="flex items-center gap-[.5vw] w-fit cursor-pointer">

                            <span className="relative overflow-hidden inline-flex h-[1.3em]">
                                <span className="inline-block transition-transform duration-300 group-hover:-translate-y-full">{children}</span>
                                <span className="inline-block absolute left-0 top-0 translate-y-full transition-transform duration-300 group-hover:translate-y-0">{children}</span>
                            </span>

                            <svg className="transition-transform duration-300 group-hover:translate-y-[3px] size-2" width="10" height="13" viewBox="0 0 10 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8.24036 7.72066C8.30902 7.64697 8.39182 7.58787 8.48382 7.54688C8.57582 7.50589 8.67513 7.48384 8.77583 7.48207C8.87654 7.48029 8.97656 7.49882 9.06995 7.53654C9.16334 7.57426 9.24817 7.6304 9.31939 7.70162C9.39061 7.77284 9.44676 7.85767 9.48448 7.95106C9.5222 8.04445 9.54072 8.14448 9.53895 8.24518C9.53717 8.34588 9.51513 8.4452 9.47414 8.5372C9.43314 8.6292 9.37404 8.712 9.30035 8.78066L5.30035 12.7807C5.15973 12.9211 4.9691 13 4.77035 13C4.5716 13 4.38098 12.9211 4.24035 12.7807L0.240354 8.78066C0.166667 8.712 0.107565 8.6292 0.0665735 8.5372C0.0255818 8.4452 0.00354045 8.34588 0.00176376 8.24518C-1.2927e-05 8.14448 0.0185113 8.04445 0.0562319 7.95106C0.0939526 7.85767 0.150098 7.77284 0.221317 7.70162C0.292535 7.6304 0.377369 7.57426 0.470758 7.53654C0.564147 7.49882 0.664174 7.48029 0.764877 7.48207C0.86558 7.48384 0.964894 7.50589 1.05689 7.54688C1.14889 7.58787 1.23169 7.64697 1.30035 7.72066L4.02035 10.4407L4.02036 0.750659C4.02036 0.551747 4.09937 0.360981 4.24003 0.220329C4.38068 0.0796762 4.57144 0.000659508 4.77036 0.000659526C4.96927 0.000659543 5.16003 0.0796762 5.30069 0.220329C5.44134 0.360982 5.52036 0.551747 5.52036 0.75066L5.52035 10.4407L8.24036 7.72066Z" fill="black" />
                            </svg>
                        </div>
            <div ref={underlineRef} className="absolute left-0 -bottom-0.5 w-full h-px bg-black" />
        </Link>
    );
}

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger, SplitText)
}

const groups = [
    {
        title: "Creative Front-End Developers",
        text: "Stop rebuilding the same scroll reveal, text animation, cursor trail, and transition from scratch. Start from production-ready source and shape it to your project.",
        cta: "Browse Effects",
        link: "/effects"
    },
    {
        title: "Startup Founders & Product Teams",
        text: "Make your launch page feel more premium without hiring a full motion team. Use Vault to speed up build cycles, and raise perceived product quality.",
        cta: "Start with Free Effects",
        link: "/effects/free"
    },
    {
        title: "Agencies & Freelancers",
        text: "Move faster on client websites while keeping the work custom. Use Vault as a starting point for high-end interaction systems, then adapt the code for each brand while saving hours of custom motion work on each project.",
        cta: "See agency licensing (coming soon)",
        link: "#"
    },
    {
        title: "CTOs & CPOs",
        text: "Get the creative benefit of premium motion without committing to an opaque dependency. Source-first code, clear stack choices, and a workflow your developers can own.",
        cta: "Read the Docs",
        link: "/docs"
    },
    {
        title: "Marketing Teams",
        text: "Upgrade the moments that affect perception: hero sections, campaign pages, product storytelling, proof sections, and final CTAs.",
        cta: "Explore Use Cases",
        link: "#"
    }
]

export default function ForDevelopers() {
    const containerRef = useRef(null)
    const accordionRef = useRef(null)
    const headingRef = useRef(null)

    useEffect(() => {
        const mm = gsap.matchMedia(containerRef)

        mm.add({
            isMobile: '(max-width: 639px)',
            isDesktop: '(min-width: 640px)'
        }, (context) => {
            const { isMobile } = context.conditions

            let splits = []
            const cards = gsap.utils.toArray('.dev-card')

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: accordionRef.current,
                    start: 'top top',
                    end: '80% bottom',
                    scrub: 0.5,
                }
            })

            const cardData = cards.map(card => {
                const overlay = card.querySelector('.card-overlay')
                const title = card.querySelector('.card-title')
                const text = card.querySelector('.card-text')
                const link = card.querySelector('.card-link')

                const titleSplit = new SplitText(title, { type: 'lines', linesClass: 'overflow-hidden' })
                const titleLines = new SplitText(titleSplit.lines, { type: 'lines' })

                let textSplit, textLines;
                if (text) {
                    textSplit = new SplitText(text, { type: 'lines', linesClass: 'overflow-hidden' })
                    textLines = new SplitText(textSplit.lines, { type: 'lines' })
                    splits.push(textSplit, textLines)
                }

                splits.push(titleSplit, titleLines)

                return { card, overlay, title, text, textLines, link }
            })

            // On mobile the copy length varies per card, but the open/closed
            // heights MUST be uniform across all cards - otherwise the total
            // stack height changes as different cards open/close and the whole
            // column shifts (exactly like desktop, where every card is 22vw open
            // / 6vw closed so the total stays constant). So measure every card
            // and use the tallest open height (fits the longest card without
            // clipping) and the tallest closed height (fits 2-line titles) for
            // all of them.
            let mobileOpen = null
            let mobileClosed = null
            if (isMobile) {
                const opens = cardData.map(({ card }) => Math.ceil(card.offsetHeight * 1.15))
                const closeds = cardData.map(({ card, title }) => {
                    const cs = getComputedStyle(card)
                    const padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom)
                    return Math.ceil(title.offsetHeight + padY)
                })
                mobileOpen = Math.max(...opens)
                mobileClosed = Math.max(...closeds)
            }

            const openH = () => (isMobile ? mobileOpen : '22vw')
            const closedH = () => (isMobile ? mobileClosed : '6vw')
            // The open title is enlarged with a transform scale, which on the
            // narrow mobile card pushes long titles past the edge. Scale less on
            // mobile so it stays in bounds; desktop keeps its original 1.3.
            const openTitleScale = isMobile ? 1.2 : 1.6

            // Setup
            cardData.forEach((data, i) => {
                const blobs = data.card.querySelectorAll('.blob')
                gsap.set([data.title, data.text, data.link], { opacity: 1 })
                gsap.set(data.title, { transformOrigin: "left top" }) // Set origin for scaling

                // Base closed background
                gsap.set(data.card, { backgroundColor: 'rgba(255, 255, 255, 0.05)' })

                if (i === 0) {
                    gsap.set(data.card, { height: openH() })
                    gsap.set(data.overlay, { opacity: 1 }) // fully open
                    gsap.set(blobs, { scale: 5.5, opacity: 1 })
                    gsap.set(data.card.querySelector('.solid-fill'), { opacity: 1 })
                    gsap.set([data.title, data.text, data.link], { color: '#000000' })
                    gsap.set(data.title, { y: '0vw', scale: openTitleScale }) // Scaled up when open
                    if (data.textLines) gsap.set(data.textLines.lines, { yPercent: 0, opacity: 1 })
                    if (data.link) gsap.set(data.link, { opacity: 1, y: 0 })
                } else {
                    gsap.set(data.card, { height: closedH() })
                    gsap.set(data.overlay, { opacity: 0 }) // fully closed
                    gsap.set(blobs, { scale: 0, opacity: 0 })
                    gsap.set(data.card.querySelector('.solid-fill'), { opacity: 0 })
                    gsap.set([data.title, data.text, data.link], { color: '#ffffff' })
                    gsap.set(data.title, { y: '0vw', scale: 1 }) // Normal scale when closed
                    if (data.textLines) gsap.set(data.textLines.lines, { yPercent: 100, opacity: 0 })
                    if (data.link) gsap.set(data.link, { opacity: 0, y: 20 })
                }
            })

            for (let i = 0; i < cardData.length - 1; i++) {
                const cur = cardData[i];
                const nxt = cardData[i + 1];
                const time = i;

                // Close current
                let curAnim = tl.to(cur.card, { height: closedH(), duration: 1, ease: 'none' }, time)
                    .to(cur.overlay, { opacity: 0, duration: 1, ease: 'none' }, time)
                    .to(cur.card.querySelector('.solid-fill'), { opacity: 0, duration: 0.5, ease: 'none' }, time)
                    .to(cur.card.querySelectorAll('.blob'), { scale: 0, opacity: 0, duration: 0.8, stagger: 0.05, ease: 'power2.inOut' }, time)
                    .to(cur.title, { y: '0vw', scale: 1, duration: 1, ease: 'none' }, time)
                    .to([cur.title, cur.text], { color: '#ffffff', duration: 0.2 }, time + 0.2)

                if (cur.textLines) {
                    curAnim.to(cur.textLines.lines, { yPercent: -50, opacity: 0, duration: 0.3, stagger: 0.02, ease: 'power2.in' }, time)
                }
                if (cur.link) {
                    curAnim.to(cur.link, { opacity: 0, y: -20, duration: 0.2, ease: 'power2.in' }, time)
                }

                // Open next
                let nxtAnim = tl.to(nxt.card, { height: openH(), duration: 1, ease: 'none' }, time)
                    .to(nxt.overlay, { opacity: 1, duration: 0.2, ease: 'none' }, time)
                    .to(nxt.card.querySelectorAll('.blob'), { scale: 1.5, opacity: 1, duration: 1, stagger: 0.1, ease: 'power2.out' }, time)
                    .to(nxt.card.querySelector('.solid-fill'), { opacity: 1, duration: 0.5, ease: 'power2.inOut' }, time + 0.5)
                    .to(nxt.title, { y: '0vw', scale: openTitleScale, duration: 1, ease: 'none' }, time)
                    .to([nxt.title, nxt.text, nxt.link], { color: '#000000', duration: 0.2 }, time + 0.2)

                if (nxt.textLines) {
                    nxtAnim.to(nxt.textLines.lines, { yPercent: 0, opacity: 1, stagger: 0.02, duration: 0.3, ease: 'power2.out' }, time + 0.3)
                }
                if (nxt.link) {
                    nxtAnim.fromTo(nxt.link, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }, time + 0.4)
                }
            }

            // Desktop only: the heading drifts as the cards open/close. On mobile
            // it sits directly above the stacked cards, so keep it completely
            // static (no translate) while cards open and close.
            if (!isMobile) {
                tl.fromTo(headingRef.current, {
                    yPercent: 70,
                }, {
                    yPercent: 10,
                    duration: cardData.length - 1,
                    ease: 'none'
                }, 0)
            }

            return () => {
                splits.forEach(s => s.revert())
            }
        })

        return () => mm.revert()
    }, [])

    return (
        <div ref={containerRef}>
            <section ref={accordionRef} className='h-[300vh] mt-[-20vh] w-full relative'>
                <div className='h-screen w-full  self-padd py-[2vw]! text-foreground sticky top-0 flex justify-between items-start max-md:flex-col'>
                     <MaskTextReveal stagger={0.08} scrub={false} duration={2} >

                   
                    <h2 ref={headingRef} className='w-[33vw] font-medium text64 h-fit max-sm:pt-[5vw] max-md:w-full tracking-tight leading-[1.1]'>
                        For Developers, Founders, Agencies, and Teams That Need the Site to Feel as Premium as the Product.
                    </h2>
                      </MaskTextReveal>

                    <div className='relative w-[55vw] flex flex-col gap-[1vw] max-md:w-full max-sm:gap-[5vw] max-sm:mt-[5vw]'>
                        {groups.map((group, idx) => (
                            <div key={idx} className='dev-card relative flex flex-col items-start justify-between px-[2.5vw] py-[1.5vw] max-sm:px-[6vw] max-sm:py-[6vw] overflow-hidden rounded-md border border-white/5 w-full backdrop-blur-md'>
                                <div className='card-overlay absolute rounded-md inset-0 z-0 overflow-hidden! opacity-0'>
                                    <div className='blob absolute size-[80%] left-[-10%] top-[-10%] bg-white rounded-full blur-[3vw] '></div>
                                    <div className='blob absolute size-[80%] right-[-10%] bottom-[-10%] bg-white rounded-full blur-[3vw] '></div>
                                    <div className='blob absolute size-[80%] left-[10%] bottom-[-10%] bg-white rounded-full blur-[3vw] '></div>
                                    <div className='blob absolute size-[80%] right-[10%] top-[-10%] bg-white rounded-full blur-[3vw] '></div>

                                    {/* <div className='noise-layer absolute inset-0 opacity-[0.25] mix-blend-overlay pointer-events-none' style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div> */}

                                    {/* <div className='solid-fill absolute inset-0 opacity-0 pointer-events-none' style={{ background: 'radial-gradient(120% 100% at 50% 100%, rgba(255, 255, 255, 1) 0%, rgba(230, 230, 230, 1) 100%)' }}></div> */}
                                </div>

                                <div className='relative z-10 flex flex-col gap-[3vw] max-sm:gap-[4vw] w-full'>
                                    <p className='text34 card-title opacity-0 font-medium tracking-tight max-md:text-[6vw] max-sm:wrap-break-word'>{group.title}</p>
                                    <p className='text34 card-text opacity-0 leading-[1.1]'>{group.text}</p>
                                </div>
                                <AnimatedLink href={group.link || "#"} className="card-link z-10 text-sm opacity-0 font-medium max-sm:text-base max-sm:font-normal text-black">
                                    {group.cta}
                                </AnimatedLink>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}
