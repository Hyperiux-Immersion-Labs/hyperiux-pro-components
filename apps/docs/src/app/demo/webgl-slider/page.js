import WebGLSlider from '@/components/webgl-slider'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import ScrollBottom from '@/components/WebsiteComps/ScrollBottom'
import React from 'react'

const page = () => {
  return (
    <>
    <DemoHeader logoColor="#ffffff" textColor="#ffffff"/>
    <WebGLSlider/>
    <div className='w-fit fixed left-[3%] top-1/2 -translate-y-1/2 text-[4vw] max-md:top-[10%] max-md:left-1/2 max-md:-translate-x-1/2 max-md:text-[6vw] max-sm:text-[9vw] max-md:w-full max-md:text-center'>
        WebGL Slider
    </div>
    <ScrollBottom/>
    
    </>
  )
}

export default page