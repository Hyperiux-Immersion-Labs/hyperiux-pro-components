import React from 'react'
import RandomBlur from './RandomBlur'

const Problem = () => {
    return (
        <section className='w-full h-fit px-[3vw] relative z-100 pt-[15%] pb-[5%]' id='problem'>
            <RandomBlur as="h2" className='text110 w-full text-center'>
                Most Modern Websites Look Polished. Too Few Feel <span className='text-[#ff5f00]'> Memorable.</span>
            </RandomBlur>
          
        </section>
    )
}

export default Problem