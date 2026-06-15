import GridScale from '@/components/GridScale'
import LenisSmoothScroll from '@/components/SmoothScroll/LenisScroll'
import ScrollBottom from '@/components/WebsiteComps/ScrollBottom'
import React from 'react'

const page = () => {
  return (
    <>
    <LenisSmoothScroll />
    <GridScale/>
    <ScrollBottom/>
    </>
  )
}

export default page