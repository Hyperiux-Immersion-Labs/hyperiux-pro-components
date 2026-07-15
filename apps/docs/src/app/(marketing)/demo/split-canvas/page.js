import React from 'react'
import ScrollBottom from '@/components/WebsiteComps/ScrollBottom'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import SplitCanvas from '@/components/split-canvas'
import { getDemoPageMetadata } from "@/lib/demo-metadata";


const page = () => {
  return (
    <>
      <DemoHeader />
      <ScrollBottom textColor={'text-black'} className='bottom-[3%] gap-[1vw]' />
      <h1 clasName="aboslute sr-only text-white text-4xl font-bold">SplitCanvas</h1>
      <SplitCanvas />

    </>
  )
}

export default page
export async function generateMetadata() {
  return getDemoPageMetadata("split-canvas");
}
