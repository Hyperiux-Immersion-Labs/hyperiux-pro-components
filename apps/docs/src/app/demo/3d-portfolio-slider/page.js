import React from 'react'
import PortfolioSlider3D from '@/components/3d-portfolio-slider'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import ScrollBottom from '@/components/WebsiteComps/ScrollBottom'
import { getDemoPageMetadata } from "@/lib/demo-metadata";


const page = () => {
  return (
    <>
    <DemoHeader logoColor='#FFFFFF' textColor='#ffffff' />
   <PortfolioSlider3D />
   <ScrollBottom textColor='#ffffff' />
    </>
  )
}

export default page
export async function generateMetadata() {
  return getDemoPageMetadata("3d-portfolio-slider");
}
