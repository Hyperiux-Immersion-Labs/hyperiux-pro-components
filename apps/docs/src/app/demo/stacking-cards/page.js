import StackingCards from '@/components/stacking-cards'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import ScrollBottom from '@/components/WebsiteComps/ScrollBottom'
import React from 'react'
import { ReactLenis } from'lenis/react'

const page = () => {
  return (
   <>
   <DemoHeader />
    <ReactLenis root>

   <StackingCards/>
    </ReactLenis>
   <ScrollBottom textColor={"text-[#111111]"} className='bottom-[1%]'/>
   </>
  )
}

export default page