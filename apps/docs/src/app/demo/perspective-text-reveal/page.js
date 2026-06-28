import React from 'react'
import PerspectiveTextWrapper from './PerspectiveTextWrapper'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import ScrollBottom from '@/components/WebsiteComps/ScrollBottom'

const page = () => {
  return (
    <>
     <DemoHeader logoColor="#ffffff" textColor="#ffffff" />
      <ScrollBottom textColor='#ffffff' />
      <PerspectiveTextWrapper />
    </>
  )
}

export default page