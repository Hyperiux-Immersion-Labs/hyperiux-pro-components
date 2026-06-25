import WebGLSlider from '@/components/webgl-slider'
import ScrollBottom from '@/components/WebsiteComps/ScrollBottom'
import React from 'react'

const page = () => {
  return (
    <>
    <WebGLSlider/>
    <div className='w-fit fixed left-[3%] top-1/2 -translate-y-1/2 text-[4vw]'>
        WebGL Slider
    </div>
    <ScrollBottom/>
    
    </>
  )
}

export default page