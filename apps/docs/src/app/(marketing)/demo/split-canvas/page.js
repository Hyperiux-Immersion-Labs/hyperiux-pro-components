import React from 'react'
import ScrollBottom from '@/components/WebsiteComps/ScrollBottom'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import SplitCanvas from '@/components/split-canvas'
import { getDemoPageMetadata } from "@/lib/demo-metadata";


const page = () => {
  return (
    <>
      <DemoHeader />
      <div className='relative h-full'>

      <ScrollBottom textColor={'text-black'} className='bottom-[3%] gap-[1vw]' />
      <SplitCanvas />
      </div>

    </>
  )
}

export default page
export async function generateMetadata() {
  return getDemoPageMetadata("split-canvas");
}
