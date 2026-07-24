import HyperiuxGlitter from '@/components/hyperiux-glitter'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import React from 'react'
import { getDemoPageMetadata } from "@/lib/demo-metadata";


const page = () => {
  return (
   <>
   <DemoHeader textColor='#ffffff' logoColor='#FFFFFF' />
   <HyperiuxGlitter/>
   </>
  )
}

export default page
export async function generateMetadata() {
  return getDemoPageMetadata("hyperiux-glitter");
}
