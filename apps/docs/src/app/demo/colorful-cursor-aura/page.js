import React from 'react'
import LenisSmoothScroll from '@/components/SmoothScroll/LenisScroll'
import ColorfulCursorAura from '@/components/colorful-cursor-aura'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'

const page = () => {
  return (
    <>
    <DemoHeader />
      <LenisSmoothScroll />
   <ColorfulCursorAura/>
    </>
  )
}

export default page