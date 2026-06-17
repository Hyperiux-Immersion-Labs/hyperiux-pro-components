import React from'react'
import HeadAnim from '@/components/Animations/HeadAnim'
import Copy from '@/components/Animations/Copy'
import DonutParticlesComp from './DonutParticlesComp'

const DonutParticles = () => {
 return (
 <>
 <div className="relative h-screen w-screen overflow-hidden bg-black">
 <DonutParticlesComp
  className="absolute inset-0"
  donutPosition={[1, -0.25, 0]}
 />
 {/* Copy */}
 <div className="relative z-20 h-full w-full flex items-center max-md:items-start">
 <div className="w-full max-w-2xl px-10 absolute bottom-10 left-0 max-md:top-10 max-md:bottom-auto max-md:px-6 max-sm:px-4">
 <HeadAnim>
 <h1 className="leading-none uppercase text-[7vw] text-white font-medium max-md:text-[10vw] max-sm:text-[12vw]">
 Brands Built <span className=' text-purple-500'> Boldly</span>
 </h1>
 </HeadAnim>
 </div>
 </div>

 <div className="absolute bottom-8 right-10 z-20 max-md:bottom-10 max-w-md max-md:right-4  text-right max-md:w-[50vw]">
  <Copy delay={0.5}>
 <p className="text-white max-md:text-xl max-sm:text-sm text-lg">
 From strategy to visuals, we craft branding that tells your story and leaves a lasting impression.
 </p>
 </Copy>
 </div>

 <div className='hidden max-md:flex absolute bottom-8 left-6 w-[30vw] max-sm:w-[35vw] max-sm:text-[3.5vw] justify-end text-center bg-white/20 backdrop-blur-[0.5vw] rounded-lg  text-white text-[2.5vw] p-2'>
      Experience the full magic on desktop
 </div>
 </div>
 </>
  )
}

export default DonutParticles
