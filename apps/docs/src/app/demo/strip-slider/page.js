import HeadAnim from '@/components/Animations/HeadAnim'
import StripSlider from '@/components/strip-slider'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import SplitLine from '@/components/WebsiteComps/SplitLine'
import React from 'react'

const page = () => {
  return (
    <>
    <DemoHeader logoColor='#ffffff' textColor='#ffffff'/>
     <div className="absolute inset-0 z-1 flex h-full w-full flex-col items-center gap-[1vw] px-[5vw] pt-[7%] max-md:pt-[15%] max-sm:pt-[30%] pointer-events-none">
            <HeadAnim>
              <h1 className="text-[4vw] max-md:text-[7vw] max-sm:text-[9vw] max-md:hidden">
                Strip Slider
              </h1>
            </HeadAnim>
    
            <SplitLine
              as="p"
              start="top 120%"
              className="absolute bottom-[15%] w-[40%] text-center max-md:hidden"
            >
              Hover over the slider to see the effect
            </SplitLine>
    
           
          </div>
    <StripSlider/>
    </>
  )
}

export default page