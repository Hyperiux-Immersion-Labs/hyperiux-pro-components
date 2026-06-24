"use client"

import React, { useEffect } from 'react'
import SplitLine from '../WebsiteComps/SplitLine'
import RandomBlur from '../WebsiteComps/RandomBlur'
import gsap from 'gsap'

const Pricing = () => {
    useEffect(() => {
            const ctx = gsap.context(() => {
                gsap.set('#pricing', {
                    backgroundColor: '#0e0e0e',
                    color: '#ffffff',
                })
                gsap.set('#Workflow', {
                    backgroundColor: '#0e0e0e',
                    color: '#ffffff',
                })
                gsap.set('#AgencyProof', {
                    backgroundColor: '#fff',
                    color: '#0e0e0e',
                })
    
                const colorSwitchTimeline = gsap.timeline({
                    scrollTrigger: {
                        trigger: '#pricing',
                        start: '10% 70%',
                        end: '120% 70%',
                        markers: false,
                        onEnter: () => {
                            gsap.to('#pricing', {
                                backgroundColor: '#fff',
                                color: '#0e0e0e',
                                duration: 0.4,
                                ease: 'linear',
                            })
                            gsap.to('#LeftBlur', {
                                background: 'linear-gradient(to right, #fff, rgba(255,255,255,0.7), transparent)',
                                duration: 0.4,
                                ease: 'linear',
                            })
                            gsap.to('#RightBlur', {
                                background: 'linear-gradient(to left, #fff, rgba(255,255,255,0.7), transparent)',
                                duration: 0.4,
                                ease: 'linear',
                            })
    
                            gsap.to('#Workflow', {
                                backgroundColor: '#fff',
                                color: '#0e0e0e',
                                duration: 0.4,
                                ease: 'linear',
                            }, "<")
                            gsap.to('#marquee-svg', {
                                filter: 'invert(1)',
                                duration: 0.4,
                                ease: 'linear',
                            }, "<")
                        },
                        onLeaveBack: () => {
                            gsap.to('#pricing', {
                                backgroundColor: '#0e0e0e',
                                color: '#ffffff',
                                duration: 0.4,
                                ease: 'linear',
                            })
                            gsap.to('#marquee-svg', {
                                filter: 'invert(0)',
                                duration: 0.4,
                                ease: 'linear',
                            }, "<")
                            gsap.to('#Workflow', {
                                backgroundColor: '#0e0e0e',
                                color: '#ffffff',
                                duration: 0.4,
                                ease: 'linear',
                            }, "<")
                            gsap.to('#LeftBlur', {
                                background: 'linear-gradient(to right, #0e0e0e, rgba(14,14,14,0.7), transparent)',
                                duration: 0.4,
                                ease: 'linear',
                            })
                            gsap.to('#RightBlur', {
                                background: 'linear-gradient(to left, #0e0e0e, rgba(14,14,14,0.7), transparent)',
                                duration: 0.4,
                                ease: 'linear',
                            })
    
                        },
                        onLeave: () => {
    
                            gsap.to('#pricing', {
                                backgroundColor: '#0e0e0e',
                                color: '#ffffff',
                                duration: 0.4,
                                ease: 'linear',
                            })
                            gsap.fromTo('#AgencyProof', {
                                backgroundColor: '#fff',
                                color: '#0e0e0e',
                            }, {
                                backgroundColor: '#0e0e0e',
                                color: '#ffffff',
                                duration: 0.4,
                                ease: 'linear',
                            })
                        },
                        onEnterBack: () => {
                            gsap.to('#pricing', {
                                backgroundColor: '#fff',
                                color: '#0e0e0e',
                                duration: 0.4,
                                ease: 'linear',
                            })
                            gsap.to('#AgencyProof', {
                                backgroundColor: '#fff',
                                color: '#0e0e0e',
                                duration: 0.4,
                                ease: 'linear',
                            })
                        }
                    },
                })
            })
    
            return () => ctx.revert()
        }, [])
    return (
        <section id='pricing' className="h-fit relative z-10 bg-white text-background py-[10vw] pt-[15vw] max-sm:pt-[40vw] max-md:pb-[30vw] gap-[2vw] max-md:gap-[8vw] flex-col w-full px-[5vw] max-md:px-[8vw] flex items-center justify-center overflow-x-hidden ">
            <SplitLine as="p"
                className="text22 text-light-grey">
                Free Vault
            </SplitLine>

            <RandomBlur as="h2" className="text140 text-center w-[75vw] max-md:w-[90vw]">
                Everything you need today is free.
            </RandomBlur>
            <SplitLine delay={0.3} as="p" className="text34 text-center mt-[4vw] max-md:mt-[6vw] w-[65vw] max-md:w-[90vw]">
                Get early access to premium effect packs, complete website sections, founder pricing,
                and experimental releases before anyone else.
            </SplitLine>
        </section>
    )
}

export default Pricing