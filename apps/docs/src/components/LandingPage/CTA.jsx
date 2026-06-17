import React from 'react'
import SplitLine from '../WebsiteComps/SplitLine'
import RandomBlur from '../WebsiteComps/RandomBlur'
import Button from '../WebsiteComps/Button'

export default function CTA() {
    return (
        <div className='h-screen max-md:h-fit max-md:py-[20vw] max-md:mb-[30vw]  overflow-x-hidden flex items-center justify-center max-md:gap-[8vw] flex-col bg-foreground text-background relative z-500 w-full'>
            <RandomBlur as="h2" className='text110 pointer-events-auto max-md:px-0! px-[10vw] text-center'>
                Unlock Next-Level Digital <br /> Experiences.
            </RandomBlur>
            <SplitLine
                delay={0.3}
                as="p"
                className="text34 text-center mt-[4vw] w-[60vw]"
            >
                Power your site with Hyperiux’s interaction layer. Bring your frontend to life with vivid, modern creative engineering.

            </SplitLine>
            <div className='flex items-center py-[2vw] mb-[2vw] justify-center gap-[2vw]'>
                <Button text="Explore The Vault" className='border border-primary' />
                <Button text="Let's Collaborate" className='border border-black' variant="black" />
            </div>
        </div>
    )
}
