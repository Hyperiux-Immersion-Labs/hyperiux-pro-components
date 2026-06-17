import GridScale from '@/components/GridScale'
import LenisSmoothScroll from '@/components/SmoothScroll/LenisScroll'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import ScrollBottom from '@/components/WebsiteComps/ScrollBottom'
import React from 'react'

const page = () => {
  return (
    <>
    <LenisSmoothScroll />
    <DemoHeader textColor='#ffffff' logoColor='#ffffff' />
    <GridScale/>
    <ScrollBottom/>
    </>
  )
}

export default page