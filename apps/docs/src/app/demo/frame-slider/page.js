import FrameSlider from '@/components/frame-slider'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import ScrollBottom from '@/components/WebsiteComps/ScrollBottom'
import React from 'react'

const page = () => {
  return (
   <>
       <DemoHeader logoColor="#FFFFFF"/>
       <FrameSlider />
       <ScrollBottom className="bottom-[3%]"/>
   </>
  )
}

export default page