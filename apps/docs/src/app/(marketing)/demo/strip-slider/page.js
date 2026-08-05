import HeadAnim from '@/components/Animations/HeadAnim'
import StripSlider from '@/components/strip-slider'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import SplitLine from '@/components/WebsiteComps/SplitLine'
import React from 'react'
import { getDemoPageMetadata } from "@/lib/demo-metadata";


const page = () => {
  return (
    <>
    <DemoHeader logoColor='#FFFFFF' textColor='#ffffff'/>
     <div className="absolute inset-0 z-1 flex h-full w-full flex-col items-center gap-[1vw] px-[5vw] pt-[7%] max-[1025px]:pt-[15%] max-md:pt-[30%] pointer-events-none">
            <HeadAnim animateOnScroll={false}>
              <h1 className="text-[4vw] max-[1025px]:text-[7vw] max-md:text-[9vw] max-[1025px]:absolute max-[1025px]:bottom-5">
                Strip Slider
              </h1>
            </HeadAnim>
    
            <SplitLine
              as="p"
              start="top 120%"
              className="absolute bottom-[15%] w-[40%] text-center max-[1025px]:hidden"
            >
              Hover over the slider to see the effect
            </SplitLine>

             <SplitLine
              as="p"
              start="top 120%"
              className="absolute bottom-[7%] right-3 max-md:right-1 max-[1025px]:w-[20%] max-md:w-[30%] text-center max-[1025px]:block hidden px-1 py-3 backdrop-blur-md rounded-lg bg-white/5"
            >
                Tap to try , Better on desktop
            </SplitLine>
    
           
          </div>
    <StripSlider/>
    </>
  )
}

export default page
export async function generateMetadata() {
  return getDemoPageMetadata("strip-slider");
}
