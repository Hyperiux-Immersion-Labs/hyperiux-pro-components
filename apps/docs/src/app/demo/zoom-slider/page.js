import LenisSmoothScroll from '@/components/SmoothScroll/LenisScroll'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import ZoomSlider from '@/components/zoom-slider'
import React from 'react'


const page = () => {
  return (
    <>
    <DemoHeader logoColor='#ffffff' textColor='#ffffff' />
    <LenisSmoothScroll />
    <ZoomSlider/>
    </>
  )
}

export default page