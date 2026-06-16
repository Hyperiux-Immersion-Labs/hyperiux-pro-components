import React from 'react'
import { HelixSlider } from '@/components/helix-slider'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import ScrollBottom from '@/components/WebsiteComps/ScrollBottom'

const page = () => {
  return (
    <>
    <DemoHeader logoColor="#ffffff"  />
   <HelixSlider />
   <ScrollBottom className='z-90 bottom-[5%] gap-[0.5vw] ' textColor={'text-white'} />
    </>
  )
}

export default page