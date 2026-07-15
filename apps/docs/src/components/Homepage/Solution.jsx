'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import SplitText from 'gsap/SplitText'
import CodeBlockWorkflow from './CodeBlockWorkFlow'
import LineReveal from '../Animations/LineReveal'
import LinkButton from '../WebsiteComps/LinkButton'

const SECTION_ID = 'hero-break'
const SPLIT_CHARACTER_SELECTOR = '.split-chars'

const SOLUTION_TEXT =
    'Scroll systems, cursor effects, text reveals, page transitions, and WebGL scenes, refined on real client launches. Preview the moment you need, install it with one command, then tune it in your own repo. It’s not a black box. It’s not another UI kit. It’s real, inspectable code you own.'

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger, SplitText)
}

const Solution = () => {
    const sectionRef = useRef(null)
    const textRef = useRef(null)

    useEffect(() => {
        const styleId = `tfa-style-${SECTION_ID}`
        const styleElement = document.createElement('style')

        styleElement.id = styleId
        styleElement.textContent = `
            @keyframes color-transition-${SECTION_ID} {
                0% { color: #272727; }
                30% { color: #ff5f00; }
                100% { color: #ffffff; }
            }

            #${SECTION_ID} .split__wrapper ${SPLIT_CHARACTER_SELECTOR} {
                transition: color .4s;
                color: #272727;
            }

            #${SECTION_ID} .split__wrapper ${SPLIT_CHARACTER_SELECTOR}.show {
                animation: color-transition-${SECTION_ID} .5s;
                color: #ffffff;
            }

            #${SECTION_ID}.tfa-preload .split__wrapper ${SPLIT_CHARACTER_SELECTOR},
            #${SECTION_ID}.tfa-preload .split__wrapper ${SPLIT_CHARACTER_SELECTOR}.show {
                transition: none;
                animation: none;
            }

            #${SECTION_ID} .tfa-text-wrapper {
                width: 100%;
            }

            #${SECTION_ID} .tfa-heading {
                font-size: 4vw;
            }

            @media (min-width: 768px) and (max-width: 1024px) {
                #${SECTION_ID} .tfa-text-wrapper {
                    width: 88%;
                }

                #${SECTION_ID} .tfa-heading {
                    font-size: 5vw;
                }
            }

            @media (max-width: 767px) {
                #${SECTION_ID} .tfa-text-wrapper {
                    width: 95%;
                }

                #${SECTION_ID} .tfa-heading {
                    font-size: 7vw;
                }
            }
        `

        document.head.appendChild(styleElement)

        const context = gsap.context(() => {
            const textElement = textRef.current

            if (!textElement) {
                return
            }

            // Mute the CSS transition/animation while the timeline is wired up, so
            // reloading mid-scroll doesn't replay the colour keyframe on every
            // already-revealed character at once (the one-off "blink").
            const section = sectionRef.current
            section?.classList.add('tfa-preload')

            const split = SplitText.create(textElement, {
                type: 'words chars',
                aria: false,
                tag: 'span',
                charsClass: 'split-chars',
            })

            gsap.set(textElement, {
                opacity: 1,
            })

            const characters = Array.from(
                textElement.querySelectorAll(SPLIT_CHARACTER_SELECTOR)
            )

            gsap
                .timeline({
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top top',
                        end: 'bottom bottom',
                        scrub: 0.25,
                    },
                })
                .to(
                    characters,
                    {
                        className: 'split-chars show',
                        duration: 0.4,
                        stagger: 0.05,
                        ease: 'power2.inOut',
                    },
                    0
                )

            // Once ScrollTrigger has applied the scrubbed starting state, pin the
            // already-revealed characters to their final look (no entry animation)
            // and lift the mute. Characters scrolled into afterwards still pop.
            const raf = requestAnimationFrame(() => {
                characters.forEach((char) => {
                    if (char.classList.contains('show')) {
                        char.style.animation = 'none'
                        char.style.transition = 'none'
                    }
                })

                section?.classList.remove('tfa-preload')
            })

            return () => {
                cancelAnimationFrame(raf)
                section?.classList.remove('tfa-preload')
                split.revert()
            }
        })

        return () => {
            context.revert()
            document.getElementById(styleId)?.remove()
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

                        <div className="split__wrapper tfa-text-wrapper relative z-10 mx-auto">
                            <h2
                                ref={textRef}
                                className="tfa-heading opacity-0 font-display font-medium leading-[1.18] tracking-[-0.03em]"
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
