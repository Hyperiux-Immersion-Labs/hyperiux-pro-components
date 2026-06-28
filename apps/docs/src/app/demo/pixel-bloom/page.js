import React from 'react'
import PixelBloomWrapper from './PixelBloomWrapper'
import LenisSmoothScroll from '@/components/SmoothScroll/LenisScroll'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import ScrollBottom from '@/components/WebsiteComps/ScrollBottom'

const page = () => {
  return (
    <>
        <LenisSmoothScroll />
        <DemoHeader />
        <PixelBloomWrapper />
          <ScrollBottom textColor='text-[#111111]' />
    </>
  )
}

export default page