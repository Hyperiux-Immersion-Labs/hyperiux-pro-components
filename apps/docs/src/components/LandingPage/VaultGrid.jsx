'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import SplitText from 'gsap/SplitText'
import { ArrowUpRightIcon } from '@/utils/Icons'
import Image from 'next/image'

gsap.registerPlugin(ScrollTrigger, SplitText)

const BOXES = [
    {
        id: "block-top-layer-1",
        styles: "w-[37.5%]",
        img: '/img/__mock__/1.png',
        number: "01",
        label: "Scroll Effects"
    },
    {
        id: "block-top-layer-2",
        styles: "w-[25%]",
        img: '/img/__mock__/5.png',
        number: "02",
        label: "Hover Reveal"
    },
    {
        id: "block-top-layer-3",
        styles: "w-[37.5%]",
        img: '/img/__mock__/6.png',
        number: "03",
        label: "Parallax Layers"
    }
];

const BOXES_BOTTOM = [
    {
        id: "block-bottom-layer-1",
        styles: "w-[20%]",
        img: '/img/__mock__/2.png',
        number: "04",
        label: "Transitions"
    },
    {
        id: "block-bottom-layer-2",
        styles: "w-[50%]",
        img: '/img/__mock__/3.png',
        number: "05",
        label: "Text Split"
    },
    {
        id: "block-bottom-layer-3",
        styles: "w-[30%]",
        img: '/img/__mock__/4.png',
        number: "06",
        label: "GSAP Magic"
    }
];

function VaultBox({ id, styles, img, number, label }) {
    return (
        <div
            id={id}
            className={`flex p-[1vw] overflow-hidden justify-between relative h-full rounded-md ${styles}`}
        >
            <div className='absolute inset-0 bg-black/50'>
                <Image src={img} alt='image' fill className='object-cover h-full w-full' />
            </div>
            <div className='relative z-2 flex justify-between h-full w-full'>
                <div className='text24 '>
                    <p>{number}</p>
                    <p>{label}</p>
                </div>
                <div className='size-[2vw] flex items-end'>
                    <ArrowUpRightIcon className={'h-full w-full object-contain'} />
                </div>
            </div>
        </div>
    )
}

export default function VaultGrid() {
    const sectionRef = useRef(null)
    const textRef = useRef(null)
    const moveTextRef = useRef(null)
    const headingRef = useRef(null)
    const secondLayoutRef = useRef(null)

    useEffect(() => {
        if (!textRef.current || !moveTextRef.current || !headingRef.current || !sectionRef.current || !secondLayoutRef.current) return

        const ctx = gsap.context(() => {
            const split = SplitText.create(textRef.current, {
                type: 'words,chars',
            })

            // Set initial states
            gsap.set(textRef.current, { opacity: 1 })
            gsap.set(split.chars, { color: '#939393' })
            gsap.set(secondLayoutRef.current, { opacity: 0 })
            gsap.set(moveTextRef.current, { xPercent: -200 })

            const topLayer = [
                { id: 'block-top-layer-1', xPercent: 300 },
                { id: 'block-top-layer-2', xPercent: 450 },
                { id: 'block-top-layer-3', xPercent: 600 }
            ]
            const bottomLayer = [
                { id: 'block-bottom-layer-1', xPercent: 300 },
                { id: 'block-bottom-layer-2', xPercent: 450 },
                { id: 'block-bottom-layer-3', xPercent: 600 }
            ]

            topLayer.forEach(layer =>
                gsap.set(`#${layer.id}`, { xPercent: layer.xPercent })
            )
            bottomLayer.forEach(layer =>
                gsap.set(`#${layer.id}`, { xPercent: layer.xPercent })
            )

            // Master timeline controlled via ScrollTrigger
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top top",
                    end: "bottom bottom",
                    scrub: true,
                    markers: false,
                }
            })

            // 1. First animation: split text character coloring
            tl.to(split.chars, {
                color: '#ff5f00',
                stagger: 0.01,
                ease: 'none',
                duration: 2,
            })

            // 2. Fade out first text
            tl.to(textRef.current, {
                opacity: 0,
                duration: 0.8,
                ease: 'power2.out',
            })

            // 3. Fade in second layout container
            tl.to(secondLayoutRef.current, {
                opacity: 1,
                duration: 0.8,
                ease: 'power2.out',
            }, "-=0.4")

            // 4. Second animation: box and text movements (nested timeline)
            const secondTl = gsap.timeline()

            secondTl.to(moveTextRef.current, { xPercent: 0, duration: 2, ease: "power2.out" }, 0)

            topLayer.forEach((layer, i) => {
                secondTl.to(
                    `#${layer.id}`,
                    {
                        xPercent: 0,
                        duration: 1.2,
                        ease: "power2.out"
                    },
                    0.1 + i * 0.13
                )
            })

            bottomLayer.forEach((layer, i) => {
                secondTl.to(
                    `#${layer.id}`,
                    {
                        xPercent: 0,
                        duration: 1.2,
                        ease: "power2.out"
                    },
                    0.5 + i * 0.13
                )
            })

            secondTl.to([headingRef.current, moveTextRef.current], {
                opacity: 0,
                duration: 1.2,
                ease: "power2.out"
            })

            secondTl.to('#heading-container', {
                height: '1.5vw',
                transformOrigin: 'center center',
                duration: 1.2,
                ease: "power2.out"
            })

            tl.add(secondTl)

        }, sectionRef)

        return () => ctx.revert()
    }, [])

    return (
        <section
            ref={sectionRef}
            className="relative bg-background h-[700vh] w-full"
        >
            <div className="h-screen flex-col self-padd origin-center flex items-center justify-center sticky top-0 w-full overflow-hidden">
                {/* First Animation Text */}
                <h2
                    ref={textRef}
                    className="absolute text80 w-[85vw] text-center opacity-0 text-[#939393] z-20 pointer-events-none"
                >
                    Hyperiux Vault is built around the interaction layer of a
                    website, the moments people notice when they scroll, hover,
                    move.
                </h2>

                {/* Second Animation Content */}
                <div
                    ref={secondLayoutRef}
                    className="w-full flex-col flex items-center justify-center opacity-0 z-10"
                >
                    {/* Top Layer */}
                    <div className="w-full relative z-10 h-[40vh] gap-[1.5vw] flex items-center justify-center ">
                        {BOXES.map(box => (
                            <VaultBox key={box.id} {...box} />
                        ))}
                    </div>

                    {/* Middle Heading Container */}
                    <div id="heading-container" className="w-full relative z-0 h-[30vh] flex items-center justify-center ">
                        <p ref={moveTextRef} className="text-primary text80">
                            move
                        </p>
                        <h2 ref={headingRef} className="text80 text-center">
                            , navigate, read, and explore.
                        </h2>
                    </div>

                    {/* Bottom Layer */}
                    <div className="w-full h-[40vh] relative z-10 gap-[2vw] flex items-center justify-center ">
                        {BOXES_BOTTOM.map(box => (
                            <VaultBox key={box.id} {...box} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}