import HeadAnim from '@/components/Animations/HeadAnim'
import WebGLSlider from '@/components/webgl-slider'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import ScrollBottom from '@/components/WebsiteComps/ScrollBottom'
import React from 'react'
import { getDemoPageMetadata } from "@/lib/demo-metadata";


const page = () => {
  return (
    <>
      <DemoHeader logoColor='#FFFFFF' textColor="#ffffff" />
      <WebGLSlider />
      <div className='w-fit fixed left-[3%] top-1/2 -translate-y-1/2  max-md:top-[30%] max-md:left-1/2 max-md:-translate-x-1/2  max-md:w-full max-md:text-center'>
        <HeadAnim>
          <h1 className='max-md:text-[6vw] max-sm:text-[9vw] text-[4vw]'>
            WebGL Slider
          </h1>
        </HeadAnim>
      </div>
      <ScrollBottom className="max-md:hidden! bottom-[3%]" />

    </>
  )
}

export default page
export async function generateMetadata() {
  return getDemoPageMetadata("webgl-slider");
}
