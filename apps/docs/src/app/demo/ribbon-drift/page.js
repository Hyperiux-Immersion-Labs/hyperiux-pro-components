import RibbonDrift from '@/components/ribbon-drift'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import ScrollBottom from '@/components/WebsiteComps/ScrollBottom'
import React from 'react'

const page = () => {
  return (
  <>
  <DemoHeader />
  <RibbonDrift/>
  <ScrollBottom textColor='text-[#111111]' />
  </>
  )
}

export default page