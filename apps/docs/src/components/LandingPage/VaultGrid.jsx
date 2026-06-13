'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import SplitText from 'gsap/SplitText'
import VaultBox from '../Reusable/VaultBoxes'

gsap.registerPlugin(ScrollTrigger, SplitText)

const BOXES = [
    {
        id: "block-top-layer-1",
        styles: "w-[37.5%]",
        img: '/video/1.mp4',
        number: "01",
        label: "Scroll Effects"
    },
    {
        id: "block-top-layer-2",
        styles: "w-[25%]",
        img: '/video/2.mp4',
        number: "02",
        label: "Hover Reveal"
    },
    {
        id: "block-top-layer-3",
        styles: "w-[37.5%]",
        img: '/video/3.mp4',
        number: "03",
        label: "Parallax Layers"
    }
];

const BOXES_BOTTOM = [
    {
        id: "block-bottom-layer-1",
        styles: "w-[20%]",
        img: '/video/6.mp4',
        number: "04",
        label: "Transitions"
    },
    {
        id: "block-bottom-layer-2",
        styles: "w-[50%]",
        img: '/video/1.mp4',
        number: "05",
        label: "Text Split"
    },
    {
        id: "block-bottom-layer-3",
        styles: "w-[30%]",
        img: '/video/6.mp4',
        number: "06",
        label: "GSAP Magic"
    }
];

export default function VaultGrid() {
    const sectionRef = useRef(null)
    const textRef = useRef(null)
    const moveFirstTextRef = useRef(null)
    const navigatedTextRef = useRef(null)
    const readTextRef = useRef(null)
    const andTextRef = useRef(null)
    const exploreTextRef = useRef(null)
    const secondLayoutRef = useRef(null)

    useEffect(() => {
        if (
            !textRef.current ||
            !moveFirstTextRef.current ||
            !navigatedTextRef.current ||
            !readTextRef.current ||
            !andTextRef.current ||
            !exploreTextRef.current ||
            !sectionRef.current
        ) return

        const ctx = gsap.context(() => {
            // 1. Split Text
            const split = SplitText.create(textRef.current, {
                type: 'words,chars',
            })
            const moveSplit = SplitText.create(moveFirstTextRef.current, {
                type: 'words,chars',
            })

            // 2. Layer Config
            const TOP_LAYER = [
                { id: "block-top-layer-1", xPercent: 300 },
                { id: "block-top-layer-2", xPercent: 450 },
                { id: "block-top-layer-3", xPercent: 600 },
            ]
            const BOTTOM_LAYER = [
                { id: "block-bottom-layer-1", xPercent: 550 },
                { id: "block-bottom-layer-2", xPercent: 450 },
                { id: "block-bottom-layer-3", xPercent: 600 },
            ]

            // 3. Initial States
            gsap.set(textRef.current, { opacity: 1 })
            gsap.set(split.chars, { color: "#939393" })
            gsap.set(moveSplit.chars, { color: "#939393" })
            gsap.set(
                [
                    navigatedTextRef.current,
                    readTextRef.current,
                    andTextRef.current,
                    exploreTextRef.current
                ],
                {
                    xPercent: 20,
                    opacity: 0,
                    filter: "blur(10px)",
                }
            )
            TOP_LAYER.forEach(layer =>
                gsap.set(`#${layer.id}`, {
                    xPercent: layer.xPercent,
                })
            )
            BOTTOM_LAYER.forEach(layer =>
                gsap.set(`#${layer.id}`, {
                    xPercent: layer.xPercent,
                })
            )

            // 4. Master Timeline controlled with ScrollTrigger
            const master = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top top",
                    end: "bottom bottom",
                    scrub: true,
                },
            })

            // 5. Intro Timeline (character color, fade, move)
            const intro = gsap.timeline()
            intro.to(split.chars, {
                color: "#ff5f00",
                stagger: {
                    amount: 2
                },
                ease: "power4.out",
            })
            intro.to(moveSplit.chars, {
                color: "#ff5f00",
                ease: "power4.out",
            }, "-=0.25")
            intro.to(split.words, {
                opacity: 0,
                filter: "blur(10px)",
                stagger: {
                    amount: .2,
                    from: "random"
                },
                ease: "power2.out",
            })

            intro.to(moveFirstTextRef.current, {
                yPercent: -150,
                xPercent: -520,
                duration:1,
                ease: 'power2.inOut'
            },"-=0.4")

            // 6. Reveal Timeline (heading, boxes, fade, collapse)
            const reveal = gsap.timeline()
            reveal.to(
                [
                    navigatedTextRef.current,
                    readTextRef.current,
                    andTextRef.current,
                    exploreTextRef.current
                ],
                {
                    xPercent: 0,
                    opacity: 1,
                    filter: "blur(0px)",
                    stagger: 0.1,
                    ease: "power2.out",
                }
            )
            TOP_LAYER.forEach((layer, i) => {
                reveal.to(
                    `#${layer.id}`,
                    {
                        xPercent: 0,
                        duration: 1.2,
                        ease: "power2.out",
                    },
                    0.1 + i * 0.13
                )
            })
            BOTTOM_LAYER.forEach((layer, i) => {
                reveal.to(
                    `#${layer.id}`,
                    {
                        xPercent: 0,
                        duration: 1.2,
                        ease: "power2.out",
                    },
                    0.5 + i * 0.13
                )
            })
            reveal.to(
                [
                    navigatedTextRef.current,
                    readTextRef.current,
                    andTextRef.current,
                    exploreTextRef.current,
                    moveFirstTextRef.current,
                ],
                {
                    opacity: 0,
                    duration: 1.2,
                    ease: "power2.out",
                }
            )
            reveal.to("#heading-container", {
                height: "1.5vw",
                duration:1,
                transformOrigin: "center center",
                ease: "power2.inOut",
            }, "-=0.9")

            // 7. Compose Master Timeline
            master
                .add(intro)
                .add(reveal)

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
                    website, the moments people notice when they scroll, hover, <span className='opacity-0'>move</span>
                </h2>
                <p ref={moveFirstTextRef} className='absolute right-[15vw] top-[32.5vw] -translate-y-1/2 text-[#939393] text80'>move</p>

                {/* Second Animation Content */}
                <div
                    ref={secondLayoutRef}
                    className="w-full flex-col flex items-center justify-center  z-10"
                >
                    {/* Top Layer */}
                    <div className="w-full relative z-10 h-[40vh] gap-[1.5vw] flex items-center justify-center ">
                        {BOXES.map(box => (
                            <VaultBox key={box.id} {...box} />
                        ))}
                    </div>

                    {/* Middle Heading Container */}
                    <div id="heading-container" className="w-full  relative z-0 h-[30vh] flex items-center justify-center ">
                        <span className="text80 opacity-0 text-center">
                            move
                        </span>
                        <span ref={navigatedTextRef} className="text80 text-center">
                            &nbsp;, navigate,&nbsp;
                        </span>
                        <span ref={readTextRef} className="text80 text-center">
                            read,&nbsp;
                        </span>
                        <span ref={andTextRef} className="text80 text-center">
                            and&nbsp;

                        </span>
                        <span ref={exploreTextRef} className="text80 text-center">
                            explore
                        </span>
                    </div>

                    {/* Bottom Layer */}
                    <div className="w-full h-[40vh] relative z-10 gap-[1.5vw] flex items-center justify-center ">
                        {BOXES_BOTTOM.map(box => (
                            <VaultBox key={box.id} {...box} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}