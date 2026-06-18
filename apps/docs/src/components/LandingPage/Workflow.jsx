'use client'

import Button from '../WebsiteComps/Button'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'
import TechMarquee from './TechMarquee'
import RandomBlur from '../WebsiteComps/RandomBlur'
import SplitLine from '../WebsiteComps/SplitLine'

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
            className="h-fit overflow-x-hidden bg-background py-[10vw]! max-md:py-[30vw]! gap-[2vw] max-md:gap-[8vw] flex-col w-full flex items-center justify-center"
        >
            <SplitLine as="p"
                className="text22 text-light-grey">

                Workflow
            </SplitLine>


            <RandomBlur as="h2" className="text140 text-center w-[60vw] max-md:w-[70vw]">
                Preview it. Install it. Make it yours.
            </RandomBlur>

            <div className="w-full self-padd max-md:flex-col-reverse flex max-md:gap-[6vw] max-md:mt-[10vw] gap-[2.5vw] items-end mt-[4vw] flex-col">
                <div className="w-fit max-md:mx-auto! max-md:mt-[6vw] fadeup">
                    <Button text="Read Installation Docs" href="/docs" />
                </div>


                <div ref={videoRef} className="w-full h-[90vh] max-md:h-[35vh] overflow-hidden bg-zinc-700 rounded-sm">
                    {/* <video
                        src="https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/showreel.mp4"
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