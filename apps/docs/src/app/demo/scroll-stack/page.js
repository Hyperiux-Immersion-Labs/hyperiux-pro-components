import React from'react'
import { ReactLenis } from'lenis/react'
import ScrollBottom from '@/components/WebsiteComps/ScrollBottom'
import ScrollStack from '@/components/scroll-stack'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'

const page = () => {
 return (
 <>
 <ReactLenis root>
 <DemoHeader />
 <ScrollStack/>
 <ScrollBottom className='bottom-[1%] gap-[0.5vw] z-50 max-md:bottom-[5%]' textColor={'text-[#111111]'}/>
 </ReactLenis>
  </>
 )
}

export default page


