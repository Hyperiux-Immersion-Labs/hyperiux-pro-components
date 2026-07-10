import HeroBannerAnimated from '@/components/hero-banner-animated'
import React from 'react'
import { getDemoPageMetadata } from "@/lib/demo-metadata";


const page = () => {
  return (
   <>
   <HeroBannerAnimated/>
   </>
  )
}

export default page
export async function generateMetadata() {
  return getDemoPageMetadata("hero-banner-animated");
}
