'use client'

import React from 'react'
import { ReactLenis } from 'lenis/react'
import ScrollBottom from '@/components/WebsiteComps/ScrollBottom'
import InertiaScrollEffect from '@/components/InertiaScrollEffect'


export default function Page() {

  return (
    <ReactLenis root options={{ infinite: true }}>
     <InertiaScrollEffect/>
      <ScrollBottom textColor={'text-[#545454]'}/>
    </ReactLenis>
  )
}
