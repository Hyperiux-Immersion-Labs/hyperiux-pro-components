import ScrollShuffledCards from '@/components/scroll-shuffled-cards'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import ScrollBottom from '@/components/WebsiteComps/ScrollBottom'
import React from 'react'

const page = () => {
  return (
    <>
    <DemoHeader/>
   <ScrollShuffledCards/>
   <ScrollBottom textColor={'text-[#111111]'}/>
    </>
  )
}

export default page