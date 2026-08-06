import HoverStack from '@/components/hover-stack'
import React from 'react'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import { getDemoPageMetadata } from "@/lib/demo-metadata";


const page = () => {
  return (
    <>
    <DemoHeader />
    <HoverStack/>
    </>

  )
}

export default page
export async function generateMetadata() {
  return getDemoPageMetadata("hover-stack");
}
