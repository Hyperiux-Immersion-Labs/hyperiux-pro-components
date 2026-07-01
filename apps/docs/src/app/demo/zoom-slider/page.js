import LenisSmoothScroll from '@/components/SmoothScroll/LenisScroll'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import ZoomSlider from '@/components/zoom-slider'
import React from 'react'
import { getDemoPageMetadata } from "@/lib/demo-metadata";



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
export async function generateMetadata() {
  return getDemoPageMetadata("zoom-slider");
}
