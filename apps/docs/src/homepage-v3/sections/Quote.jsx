import LineReveal from '@/components/Animations/LineReveal'
import React from 'react'

export default function Quote() {
    return (
        <section className='w-full max-md:relative max-md:z-500! max-[1025px]:mt-[25vw] py-[12vw]'>
            <LineReveal as='h2' className='t96 mx-auto w-[95vw] text-center'>Most Modern Websites Look Polished. Too Few Feel <span className='gradient-text-animate'>Memorable.</span></LineReveal>
        </section>
    )
}
