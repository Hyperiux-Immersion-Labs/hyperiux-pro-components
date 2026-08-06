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
      <div className='w-fit fixed left-[3%] top-1/2 -translate-y-1/2  max-[1025px]:top-[30%] max-[1025px]:left-1/2 max-[1025px]:-translate-x-1/2  max-[1025px]:w-full max-[1025px]:text-center'>
        <HeadAnim>
          <h1 className='max-[1025px]:text-[6vw] max-md:text-[9vw] text-[4vw]'>
            WebGL Slider
          </h1>
        </HeadAnim>
      </div>
      <ScrollBottom className="max-[1025px]:hidden! bottom-[3%]" />

    </>
  )
}

export default page
export async function generateMetadata() {
  return getDemoPageMetadata("webgl-slider");
}
