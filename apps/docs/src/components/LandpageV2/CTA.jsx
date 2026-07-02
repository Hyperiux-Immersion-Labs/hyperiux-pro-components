'use client'
import React, { useEffect, useRef } from 'react'
import Button from '../WebsiteComps/Button'
import gsap from 'gsap'
import RandomBlur from '../WebsiteComps/RandomBlur'
import SplitLine from '../WebsiteComps/SplitLine'

export default function CTA() {
    const ctaRef = useRef(null)

    useEffect(() => {
        let mm = gsap.matchMedia();

        mm.add("(min-width: 768px)", () => {
            gsap.to('.cta-line', {
                opacity: 0,
                duration: 1.2,
                ease: 'sine.inOut',
                stagger: {
                    each: 0.04,
                    repeat: -1,
                    yoyo: true
                }
            })
        }, ctaRef)

        return () => mm.revert()
    }, [])

    return (
        <section ref={ctaRef} id='CTA' className='h-fit gap-[7vw] max-md:h-fit max-md:py-[15vw]! max-md:mb-[30vw]  overflow-x-hidden flex items-start  justify-between max-md:gap-[24vw] flex-col text-foreground self-padd relative z-500 w-full  py-[6vw]!'>
            <RandomBlur as="h2" className='text110 relative z-2'>Need more than a component? We build the whole interaction.</RandomBlur>
            <div className='space-y-[2.5vw] max-md:space-y-[10vw] relative z-2'>

                <SplitLine as="p" className='text24 max-md:w-full w-[31vw]'>The Vault is a public slice of how Hyperiux thinks about interaction design - the same discipline behind premium websites, product experiences, and immersive digital systems. When a copy-paste effect isn’t enough, we’ll design and build the moment from scratch.</SplitLine>
                <div className='w-fit flex  max-md:gap-[4vw] items-center max-md:flex-col max-md:items-start max-md:w-full gap-[1.5vw]'>
                    <Button variant='outline2' className='max-md:w-full' text='See our work'  href='#' />
                    <Button variant='orange' className='max-md:w-full'  href='#' text='Work with hyperiux' />
                </div>

            </div>
            
            <div className='h-[15vw] max-md:hidden z-0 w-[55vw] absolute bottom-0 right-0 pointer-events-none flex justify-between items-end'>
                {Array.from({ length: 75 }).map((_, i) => (
                    <div 
                        key={i} 
                        className='cta-line w-[1.5px] h-full bg-foreground'
                    ></div>
                ))}
            </div>

        </section>
    )
}
