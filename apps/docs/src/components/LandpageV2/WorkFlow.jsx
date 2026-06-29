'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger)
}

const steps = [
    {
        title: "Preview",
        text: "Get the creative benefit of premium motion without committing to an opaque dependency. Source-first code, clear stack choices, and a workflow your developers can own."
    },
    {
        title: "Install",
        text: "Add it to your codebase with a single command or copy-paste. Clean code that works out of the box with zero complex configuration."
    },
    {
        title: "Tune",
        text: "Easily modify timing, colors, and properties. Tweak the animation to seamlessly match your unique brand identity and product feel."
    },
    {
        title: "Ship",
        text: "Deploy a website that feels sharper, more responsive, and more memorable, without rebuilding every interaction from scratch."
    }
]

export default function Workflow() {
    const containerRef = useRef(null)
    const accordionRef = useRef(null)
    const cardsWrapperRef = useRef(null)
    const videoRef = useRef(null)
    const videoSectionRef = useRef(null)

    useEffect(() => {
        const ctx = gsap.context(() => {
            const cards = gsap.utils.toArray('.workflow-card')
            const indicators = gsap.utils.toArray('.scroll-indicator')

            // Setup initial states
            gsap.set(cards, { backgroundColor: '#161616', color: '#ffffff' })
            gsap.set(cards[0], { backgroundColor: '#ffffff', color: '#000000' })
            gsap.set(indicators, { backgroundColor: '#555555' })
            gsap.set(indicators[0], { backgroundColor: '#ffffff' })

            // Horizontal scroll timeline
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: accordionRef.current,
                    start: 'top top',
                    end: 'bottom bottom',
                    scrub: 1,
                    invalidateOnRefresh: true,
                }
            })

            // Calculate horizontal scroll distance
            const getScrollAmount = () => {
                let wrapperWidth = cardsWrapperRef.current.scrollWidth;
                let windowWidth = window.innerWidth;
                return -(wrapperWidth - windowWidth + (windowWidth * 0.07)); // 5vw padding on right
            }

            tl.to(cardsWrapperRef.current, {
                x: () => getScrollAmount(),
                ease: 'none',
                duration: 1,
                force3D: true,
            }, 0)

            // Radial glow animation
            gsap.set('.radial-glow', { opacity: 0.2, scale: 0.8, transformOrigin: 'bottom center' });
            tl.to('.radial-glow', { opacity: 0.8, scale: 1.5, duration: 1, ease: 'none' }, 0);

            // Animate card focus state (white bg) and progress indicators
            cards.forEach((card, i) => {
                const startTime = i / (cards.length - 1);
                const focusDuration = 0.15;

                if (i !== 0) {
                    // Fade to white when coming into focus
                    tl.to(card, {
                        backgroundColor: '#ffffff',
                        color: '#000000',
                        duration: focusDuration,
                        ease: 'none'
                    }, startTime - focusDuration)

                    tl.to(indicators[i], {
                        backgroundColor: '#ffffff',
                        duration: focusDuration,
                        ease: 'none'
                    }, startTime - focusDuration)
                }

                if (i !== cards.length - 1) {
                    // Fade to dark when leaving focus
                    tl.to(card, {
                        backgroundColor: '#161616',
                        color: '#ffffff',
                        duration: focusDuration,
                        ease: 'none'
                    }, startTime + focusDuration)

                    tl.to(indicators[i], {
                        backgroundColor: '#555555',
                        duration: focusDuration,
                        ease: 'none'
                    }, startTime + focusDuration)
                }
            })

            // Video animation
            gsap.fromTo(
                videoRef.current,
                {
                    clipPath: 'inset(15% 15% 15% 15%)',
                    backgroundColor: '#0A1B4B',
                },
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
            <section
                ref={accordionRef}
                id="Workflow"
                className="h-[400vh] relative"
            >
                <div className='h-screen w-full sticky top-0 flex flex-col justify-center pt-[10vw] max-md:pt-[30vw]'>
                    <h2 className='text-[5.5vw] w-[70%] text-center mx-auto mb-[6vw] relative z-20'>
                        Preview. Install. Tune <span className='text-primary'>Ship.</span>
                    </h2>

                    <div className='w-full relative z-10'>
                        {/* RADIAL GLOW */}
                        <div className='radial-glow w-[100vw] h-[50vw] absolute bottom-[-15vw] left-1/2 rounded-full -translate-x-1/2 pointer-events-none z-0' style={{ background: 'radial-gradient(50% 50% at 50% 50%, #ff5f00 0%, transparent 100%)' }}></div>

                        {/* Horizontal Scrolling Cards */}
                        <div className='w-[100vw] overflow-x-hidden relative z-10'>
                            <div
                                ref={cardsWrapperRef}
                                className='flex gap-[3vw] w-fit px-[5vw] will-change-transform'
                            >
                                {steps.map((step, idx) => (
                                    <div
                                        key={idx}
                                        className='workflow-card w-[50vw] max-h-[30vw] gap-[4vw] max-md:w-[85vw] max-md:h-[60vw] flex flex-col justify-between p-[3vw] max-md:p-[6vw] rounded-md border border-white/5'
                                    >
                                        <h3 className="card-title font-medium text-[4vw] max-md:text-[8vw] font-medium tracking-tight leading-none">{step.title}</h3>
                                        <p className="card-text leading-[1.2] text34">{step.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Progress Indicators
                        <div className='flex items-center justify-center gap-[1vw] mt-[5vw] relative z-20'>
                            {steps.map((_, idx) => (
                                <div key={idx} className='scroll-indicator w-[4vw] max-md:w-[10vw] h-[2px] rounded-full'></div>
                            ))}
                        </div> */}
                    </div>
                </div>
            </section>

            {/* Video Section */}
            <section ref={videoSectionRef} className="w-full flex items-center justify-center py-[10vw]">
                <div ref={videoRef} className="w-[100vw] h-auto max-md:p-[4vw] max-md:h-[35vh] overflow-hidden bg-primary rounded-md">
                    <video
                        src="/video/tutorial.mp4"
                        autoPlay
                        loop
                        muted
                        preload='auto'
                        playsInline
                        className="w-full h-full object-cover rounded-sm"
                    />
                </div>
            </section>
        </div>
    )
}
