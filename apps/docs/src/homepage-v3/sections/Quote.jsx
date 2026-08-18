import LineReveal from '@/components/Animations/LineReveal'
import React from 'react'

export default function Quote() {
    return (
        <section className='w-full max-md:relative max-md:z-500! max-[1025px]:mt-[25vw] py-[12vw]'>
            <LineReveal as='h2' className='t96 capitalize mx-auto w-[80vw] text-center'>Most websites are not broken. They are <span className='gradient-text-animate  '>forgettable!</span></LineReveal>
        </section>
    )
}
