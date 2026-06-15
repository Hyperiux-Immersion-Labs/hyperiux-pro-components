'use client'

import Button from '../Reusable/Button'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'
import TechMarquee from './TechMarquee'
import RandomBlur from '../Reusable/RandomBlur'

gsap.registerPlugin(ScrollTrigger)

export default function Workflow() {
    const sectionRef = useRef(null)
    const videoRef = useRef(null)

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                videoRef.current,
                {
                    scale: 0.5,
                },
                {
                    scale: 1,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: '20% 50%',
                        end: '55% 50%',
                        scrub: true,
                        markers: false,
                    },
                }
            )
        }, sectionRef)

        return () => ctx.revert()
    }, [])

    return (
        <section
            ref={sectionRef}
            id="Workflow"
            className="h-fit overflow-x-hidden bg-background py-[10vw]! max-sm:py-[30vw]! gap-[2vw] max-sm:gap-[8vw] flex-col w-full flex items-center justify-center"
        >
            <p className="text22 text-light-grey">
                Workflow
            </p>

            <RandomBlur as="h2" className="text140 text-center w-[60vw] max-sm:w-[70vw]">
                Preview it. Install it. Make it yours.
            </RandomBlur>

            <div className="w-full self-padd max-sm:flex-col-reverse flex max-sm:gap-[6vw] max-sm:mt-[10vw] gap-[2.5vw] items-end mt-[4vw] flex-col">
                <div className="w-fit max-sm:mx-auto! max-sm:mt-[6vw]">
                    <Button text="Read Installation Docs" href="/effects" />
                </div>


                <div ref={videoRef} className="w-full h-[90vh] max-sm:h-[35vh] overflow-hidden bg-zinc-700 rounded-sm">
                    {/* <video
                        src="/showreel.mp4"
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                    /> */}
                </div>
            </div>
            <TechMarquee />

        </section>
    )
}