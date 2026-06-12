'use client'

import Button from '../Reusable/Button'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'
import TechMarquee from './TechMarquee'
import SplitLine from '../Reusable/SplitLine'

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
                        end: '60% 50%',
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
            className="h-fit bg-background  py-[10vw]! gap-[2vw] flex-col w-full  flex items-center justify-center"
        >
            <p className="text22 text-light-grey">
                Workflow
            </p>

            <SplitLine as="h2" className="text140 text-center w-[60vw]">
                Preview it. Install it. Make it yours.
            </SplitLine>

            <div className="w-full self-padd flex gap-[2.5vw] items-end mt-[4vw] flex-col">
                <div className="w-fit mr-[2vw]">
                    <Button text="Read Installation Docs" href="/effects" />
                </div>

                <div className="w-full h-[90vh] overflow-hidden rounded-md">
                    <div
                        ref={videoRef}
                        className="w-full h-full bg-zinc-700"
                    />
                </div>
            </div>
            <TechMarquee />

        </section>
    )
}