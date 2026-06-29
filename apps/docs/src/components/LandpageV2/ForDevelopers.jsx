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
    }
]

export default function ForDevelopers() {
    const containerRef = useRef(null)
    const accordionRef = useRef(null)

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

                return { card, title, text, textLines, link }
            })

            // Setup
            cardData.forEach((data, i) => {
                gsap.set([data.title, data.text, data.link], { opacity: 1 })
                gsap.set(data.title, { transformOrigin: "left top" }) // Set origin for scaling

                if (i === 0) {
                    gsap.set(data.card, { height: '22vw', backgroundColor: 'rgba(255, 255, 255, 1)' })
                    gsap.set([data.title, data.text, data.link], { color: '#000000' })
                    gsap.set(data.title, { y: '0vw', scale: 1.3 }) // Scaled up when open
                    if (data.textLines) gsap.set(data.textLines.lines, { yPercent: 0, opacity: 1 })
                    if (data.link) gsap.set(data.link, { opacity: 1, y: 0 })
                } else {
                    gsap.set(data.card, { height: '6vw', backgroundColor: 'rgba(255, 255, 255, 0.05)' })
                    gsap.set([data.title, data.text, data.link], { color: '#ffffff' })
                    gsap.set(data.title, { y: '0.5vw', scale: 1 }) // Normal scale when closed
                    if (data.textLines) gsap.set(data.textLines.lines, { yPercent: 100, opacity: 0 })
                    if (data.link) gsap.set(data.link, { opacity: 0, y: 20 })
                }
            })

            for (let i = 0; i < cardData.length - 1; i++) {
                const cur = cardData[i];
                const nxt = cardData[i + 1];
                const time = i;

                // Close current
                let curAnim = tl.to(cur.card, { height: '6vw', backgroundColor: 'rgba(255, 255, 255, 0.05)', duration: 1, ease: 'none' }, time)
                    .to(cur.title, { y: '0.2vw', scale: 1, duration: 1, ease: 'none' }, time)
                    .to([cur.title, cur.text], { color: '#ffffff', duration: 0.2 }, time + 0.2)
                
                if (cur.textLines) {
                    curAnim.to(cur.textLines.lines, { yPercent: -50, opacity: 0, duration: 0.3, stagger: 0.02, ease: 'power2.in' }, time)
                }
                if (cur.link) {
                    curAnim.to(cur.link, { opacity: 0, y: -20, duration: 0.2, ease: 'power2.in' }, time)
                }

                // Open next
                let nxtAnim = tl.to(nxt.card, { height: '22vw', backgroundColor: 'rgba(255, 255, 255, 1)', duration: 1, ease: 'none' }, time)
                    .to(nxt.title, { y: '0vw', scale: 1.3, duration: 1, ease: 'none' }, time)
                    .to([nxt.title, nxt.text, nxt.link], { color: '#000000', duration: 0.2 }, time + 0.2)
                
                if (nxt.textLines) {
                    nxtAnim.to(nxt.textLines.lines, { yPercent: 0, opacity: 1, stagger: 0.02, duration: 0.3, ease: 'power2.out' }, time + 0.3)
                }
                if (nxt.link) {
                    nxtAnim.fromTo(nxt.link, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }, time + 0.4)
                }
            }

        }, containerRef)

        return () => {
            splits.forEach(s => s.revert())
            ctx.revert()
        }
    }, [])

    return (
        <div ref={containerRef}>
            <section ref={accordionRef} className='h-[300vh] w-full relative'>
                <div className='h-screen w-full overflow-hidden self-padd py-[7vw]! text-foreground sticky top-0 flex justify-between items-start max-md:flex-col'>
                    <h2 className='w-[33vw] font-medium text64 h-fit max-md:w-full tracking-tight leading-[1.1]'>
                        For Developers, Founders, Agencies, and Teams That Need the Site to Feel as Premium as the Product.
                    </h2>

                    <div className='relative w-[55vw] flex flex-col gap-[1vw] max-md:w-full'>
                        {groups.map((group, idx) => (
                            <div key={idx} className='dev-card relative flex flex-col items-start justify-between px-[2.5vw] py-[1.5vw] rounded-md border border-white/5 overflow-hidden w-full backdrop-blur-md'>
                                <div className='flex flex-col gap-[2vw] w-full'>
                                    <p className='text34 card-title opacity-0 font-medium tracking-tight max-md:text-[6vw]'>{group.title}</p>
                                    <p className='text34 card-text opacity-0 leading-[1.1]'>{group.text}</p>
                                </div>
                                <Link href="/docs" className="card-link text-sm underline underline-offset-4 decoration-1 opacity-0 w-fit font-medium">
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
