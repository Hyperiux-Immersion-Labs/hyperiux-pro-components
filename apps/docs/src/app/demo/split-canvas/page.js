import React from 'react'
import ScrollBottom from '@/components/WebsiteComps/ScrollBottom'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import SplitCanvas from '@/components/split-canvas'

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