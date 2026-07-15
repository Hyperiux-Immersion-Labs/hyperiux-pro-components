'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import SplitText from 'gsap/SplitText'
import CodeBlockWorkflow from './CodeBlockWorkFlow'
import LineReveal from '../Animations/LineReveal'
import LinkButton from '../WebsiteComps/LinkButton'

const SECTION_ID = 'hero-break'
const DIM_COLOR = '#272727'
const PRIMARY_COLOR = '#ff5f00'
const TEXT_COLOR = '#ffffff'

const SOLUTION_TEXT =
    'Scroll systems, cursor effects, text reveals, page transitions, and WebGL scenes, refined on real client launches. Preview the moment you need, install it with one command, then tune it in your own repo. It’s not a black box. It’s not another UI kit. It’s real, inspectable code you own.'

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger, SplitText)
}

const Solution = () => {
    const sectionRef = useRef(null)
    const textRef = useRef(null)

    useEffect(() => {
        const context = gsap.context(() => {
            const section = sectionRef.current
            const textElement = textRef.current

            if (!section || !textElement) return

            const split = SplitText.create(textElement, {
                type: 'words,chars',
                aria: 'none',
                tag: 'span',
                charsClass: 'split-chars',
            })

            const characters = split.chars

            gsap.set(textElement, { opacity: 1 })
            gsap.set(characters, {
                color: DIM_COLOR,
                overwrite: true,
            })

            // Scrubbed GSAP color only — no CSS transitions/keyframes.
            // Mid-scroll pause can land on orange; no load blink.
            gsap
                .timeline({
                    defaults: {
                        overwrite: 'auto',
                    },
                    scrollTrigger: {
                        trigger: section,
                        start: 'top top',
                        end: 'bottom bottom',
                        scrub: 0.25,
                        invalidateOnRefresh: true,
                    },
                })
                .fromTo(
                    characters,
                    {
                        color: DIM_COLOR,
                    },
                    {
                        keyframes: [
                            { color: PRIMARY_COLOR, duration: 0.8 },
                            { color: PRIMARY_COLOR, duration: 0.55 },
                            { color: TEXT_COLOR, duration: 1.3 },
                        ],
                        stagger: 0.05,
                        ease: 'none',
                    },
                    0
                )

            return () => {
                split.revert()
            }
        }, sectionRef)

        return () => {
            context.revert()
        }
    }, [])

    return (
        <section className='w-full h-fit px-[3vw] py-[10%]' id='solution'>
            <LineReveal as="h2" className="text110 w-full text-center">
                Vault is That Layer, Ready to <span className='text-[#ff5f00]'> Install. </span>
            </LineReveal>

            <div className='w-full h-fit flex justify-center items-center max-md:my-15 max-sm:my-[15vw]'>
                <section
                    id={SECTION_ID}
                    ref={sectionRef}
                    className='relative h-[250vh] w-full text-start'
                >
                    <div className="sticky top-0 flex h-screen items-center justify-center overflow-x-hidden">
                        <div className="absolute left-1/2 top-1/2 h-[70vh] w-[70vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff5f00]/5 blur-3xl" />

                        <div className="relative z-10 mx-auto w-full max-md:w-[88%] max-sm:w-[95%]">
                            <h2
                                ref={textRef}
                                className="opacity-0 font-display font-medium leading-[1.18] tracking-[-0.03em] text-[4vw] max-md:text-[5vw] max-sm:text-[7vw]"
                            >
                                {SOLUTION_TEXT}
                            </h2>
                        </div>
                    </div>
                </section>
            </div>

            <div className='w-full h-fit px-[2vw]' id="code-block">
                <CodeBlockWorkflow />

                <div className='flex w-full justify-center max-md:justify-center mt-[2vw] max-md:mt-0'>
                    <div className="pl-[0.65vw] text24 max-sm:leading-[1.4] max-md:text-center leading-relaxed text-[#939393] max-md:pl-0 max-md:text-sm! ">
                        <span className="inline-block">That&apos;s the whole workflow. The files land in your project. You change anything you want.&nbsp;</span>
                        <LinkButton href={"#Workflow"} shimmer tilted={false} showArrow text={"See How it Works"} />
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Solution
