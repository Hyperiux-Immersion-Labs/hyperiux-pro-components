import ScrambleText from '@/components/scramble-text'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import ScrollBottom from '@/components/WebsiteComps/ScrollBottom'
import React from 'react'

const page = () => {
  return (
    <>
    <DemoHeader />
    <ScrambleText/>
    <ScrollBottom textColor='text-black' />
    </>
  )
}

export default page