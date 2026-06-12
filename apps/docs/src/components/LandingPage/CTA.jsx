import React from 'react'
import SplitLine from '../Reusable/SplitLine'
import Button from '../Reusable/Button'

export default function CTA() {
    return (
        <div className='h-screen flex items-center justify-center flex-col bg-foreground text-background relative z-500 w-full'>
            <SplitLine as="h2" className='text110 pointer-events-auto px-[10vw] text-center'>
                Unlock Next-Level Digital Experiences.
            </SplitLine>
            <SplitLine
                delay={0.2}
                as="p"
                className="text34 text-center mt-[4vw] w-[60vw]"
            >
                Power your site with Hyperiux’s interaction layer. Bring your frontend to life with vivid, modern creative engineering.

            </SplitLine>
            <div className='flex items-center py-[2vw] mb-[2vw] justify-center gap-[2vw]'>
                <Button text="Explore The Vault" />
                <Button text="Let's Collaborate" variant="black" />
            </div>
        </div>
    )
}
