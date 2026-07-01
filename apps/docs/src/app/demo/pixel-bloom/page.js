import React from 'react'
import PixelBloomWrapper from './PixelBloomWrapper'
import LenisSmoothScroll from '@/components/SmoothScroll/LenisScroll'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import ScrollBottom from '@/components/WebsiteComps/ScrollBottom'
import { getDemoPageMetadata } from "@/lib/demo-metadata";


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
export async function generateMetadata() {
  return getDemoPageMetadata("pixel-bloom");
}
