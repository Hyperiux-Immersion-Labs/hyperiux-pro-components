import React, { useEffect, useRef } from 'react'
import Button from '../WebsiteComps/Button'
import gsap from 'gsap'

export default function CTA() {
    const ctaRef = useRef(null)

    useEffect(() => {
        let ctx = gsap.context(() => {
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

        return () => ctx.revert()
    }, [])

    return (
        <section ref={ctaRef} id='CTA' className='h-fit gap-[7vw] max-md:h-fit max-md:py-[20vw] max-md:mb-[30vw]  overflow-x-hidden flex items-start  justify-between max-md:gap-[8vw] flex-col bg-grey text-foreground self-padd relative z-500 w-full  py-[6vw]!'>
            <h2 className='text110 relative z-2'>Need more than a component? We build the whole interaction.</h2>
            <div className='space-y-[2.5vw] relative z-2'>

                <p className='text24 w-[31vw]'>The Vault is a public slice of how Hyperiux thinks about interaction design - the same discipline behind premium websites, product experiences, and immersive digital systems. When a copy-paste effect isn’t enough, we’ll design and build the moment from scratch.</p>
                <div className='w-fit flex items-center gap-[1.5vw]'>
                    <Button variant='outline2' text='See our work' />
                    <Button variant='orange' text='Work with hyperiux' />
                </div>

            </div>
            
            <div className='h-[18vw] z-0 w-[65vw] absolute bottom-0 right-0 pointer-events-none flex justify-between items-end'>
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
