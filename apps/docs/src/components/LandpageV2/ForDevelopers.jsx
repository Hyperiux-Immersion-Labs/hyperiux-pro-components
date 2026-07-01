'use client'

import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'
import { SplitText } from 'gsap/dist/SplitText'
import Link from 'next/link'

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger, SplitText)
}

const groups = [
    {
        title: "Creative Front-End Developers",
        text: "Build complex, premium interactions without fighting with generic animation libraries. Source-first code means you have complete control over every bezier curve and timing function."
    },
    {
        title: "Startup Founders & Product Teams",
        text: "Elevate your product's perceived value with premium motion design that ships fast and scales beautifully, without slowing down your core development."
    },
    {
        title: "Agencies & Freelancers",
        text: "Deliver jaw-dropping websites to your clients in record time without starting from scratch on complex animations for every new project."
    },
    {
        title: "CTOs & CPOs",
        text: "Get the creative benefit of premium motion without committing to an opaque dependency. Source-first code, clear stack choices, and a workflow your developers can own."
    },
    {
        title: "Marketing Teams",
        text: "Launch high-converting landing pages that captivate your audience. Stand out from the competition with immersive experiences that drive engagement and results."
    }
]

export default function ForDevelopers() {
    const containerRef = useRef(null)
    const accordionRef = useRef(null)
    const headingRef = useRef(null)

    useEffect(() => {
        let splits = []

        const ctx = gsap.context(() => {
            const cards = gsap.utils.toArray('.dev-card')

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: accordionRef.current,
                    start: 'top top',
                    end: 'bottom bottom',
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

            // Setup
            cardData.forEach((data, i) => {
                const blobs = data.card.querySelectorAll('.blob')
                gsap.set([data.title, data.text, data.link], { opacity: 1 })
                gsap.set(data.title, { transformOrigin: "left top" }) // Set origin for scaling

                // Base closed background
                gsap.set(data.card, { backgroundColor: 'rgba(255, 255, 255, 0.05)' })

                if (i === 0) {
                    gsap.set(data.card, { height: '22vw' })
                    gsap.set(data.overlay, { opacity: 1 }) // fully open
                    gsap.set(blobs, { scale: 1.5, opacity: 1 })
                    gsap.set(data.card.querySelector('.solid-fill'), { opacity: 1 })
                    gsap.set([data.title, data.text, data.link], { color: '#000000' })
                    gsap.set(data.title, { y: '0vw', scale: 1.3 }) // Scaled up when open
                    if (data.textLines) gsap.set(data.textLines.lines, { yPercent: 0, opacity: 1 })
                    if (data.link) gsap.set(data.link, { opacity: 1, y: 0 })
                } else {
                    gsap.set(data.card, { height: '6vw' })
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
                let curAnim = tl.to(cur.card, { height: '6vw', duration: 1, ease: 'none' }, time)
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
                let nxtAnim = tl.to(nxt.card, { height: '22vw', duration: 1, ease: 'none' }, time)
                    .to(nxt.overlay, { opacity: 1, duration: 0.2, ease: 'none' }, time)
                    .to(nxt.card.querySelectorAll('.blob'), { scale: 1.5, opacity: 1, duration: 1, stagger: 0.1, ease: 'power2.out' }, time)
                    .to(nxt.card.querySelector('.solid-fill'), { opacity: 1, duration: 0.5, ease: 'power2.inOut' }, time + 0.5)
                    .to(nxt.title, { y: '0vw', scale: 1.3, duration: 1, ease: 'none' }, time)
                    .to([nxt.title, nxt.text, nxt.link], { color: '#000000', duration: 0.2 }, time + 0.2)

                if (nxt.textLines) {
                    nxtAnim.to(nxt.textLines.lines, { yPercent: 0, opacity: 1, stagger: 0.02, duration: 0.3, ease: 'power2.out' }, time + 0.3)
                }
                if (nxt.link) {
                    nxtAnim.fromTo(nxt.link, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }, time + 0.4)
                }
            }

            tl.fromTo(headingRef.current,{
                yPercent:70,
            }, {
                yPercent: 10,
                duration: cardData.length - 1,
                ease: 'none'
            }, 0)

        }, containerRef)

        return () => {
            splits.forEach(s => s.revert())
            ctx.revert()
        }
    }, [])

    return (
        <div ref={containerRef}>
            <section ref={accordionRef} className='h-[300vh] w-full relative'>
                <div className='h-screen w-full overflow-hidden self-padd py-[2vw]! text-foreground sticky top-0 flex justify-between items-start max-md:flex-col'>
                    <h2 ref={headingRef} className='w-[33vw] font-medium text64 h-fit max-md:w-full tracking-tight leading-[1.1]'>
                        For Developers, Founders, Agencies, and Teams That Need the Site to Feel as Premium as the Product.
                    </h2>

                    <div className='relative w-[55vw] flex flex-col gap-[1vw] max-md:w-full'>
                        {groups.map((group, idx) => (
                            <div key={idx} className='dev-card relative flex flex-col items-start justify-between px-[2.5vw] py-[1.5vw] rounded-md border border-white/5 overflow-hidden w-full backdrop-blur-md'>
                                <div className='card-overlay absolute inset-0 z-0 overflow-hidden opacity-0'>
                                    <div className='blob absolute w-[60%] h-[60%] left-[-10%] top-[-10%] bg-white rounded-full blur-[3vw]'></div>
                                    <div className='blob absolute w-[60%] h-[60%] right-[-10%] bottom-[-10%] bg-[#e0e0e0] rounded-full blur-[3vw]'></div>
                                    <div className='blob absolute w-[60%] h-[60%] left-[20%] bottom-[-20%] bg-[#f5f5f5] rounded-full blur-[3vw]'></div>
                                    <div className='blob absolute w-[60%] h-[60%] right-[20%] top-[-10%] bg-[#eaeaea] rounded-full blur-[3vw]'></div>

                                    <div className='noise-layer absolute inset-0 opacity-[0.25] mix-blend-overlay pointer-events-none' style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

                                    <div className='solid-fill absolute inset-0 opacity-0 pointer-events-none' style={{ background: 'radial-gradient(120% 100% at 50% 100%, rgba(255, 255, 255, 1) 0%, rgba(230, 230, 230, 1) 100%)' }}></div>
                                </div>

                                <div className='relative z-10 flex flex-col gap-[2vw] w-full'>
                                    <p className='text34 card-title opacity-0 font-medium tracking-tight max-md:text-[6vw]'>{group.title}</p>
                                    <p className='text34 card-text opacity-0 leading-[1.1]'>{group.text}</p>
                                </div>
                                <Link href="/docs" className="card-link relative z-10 text-sm underline underline-offset-4 decoration-1 opacity-0 w-fit font-medium">
                                    Read the Docs
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}
