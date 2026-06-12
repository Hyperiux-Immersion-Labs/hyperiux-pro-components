import React from 'react'
import { SplitCanvas } from '@/components/split-canvas'
import ScrollBottom from '@/components/WebsiteComps/ScrollBottom'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'

const page = () => {
  return (
    <>
    <DemoHeader />
    <ScrollBottom textColor={'text-black'} className='bottom-[3%] gap-[1vw]' />
    <SplitCanvas />
    </>
  )
}

export default page