import React from'react'
import { ReactLenis } from'lenis/react'
import ScrollBottom from '@/components/WebsiteComps/ScrollBottom'
import ScrollStack from '@/components/ScrollStack'

const page = () => {
 return (
 <>
 <ReactLenis root>
 <ScrollStack/>
 <ScrollBottom textColor={'text-[#111111]'}/>
 </ReactLenis>
  </>
 )
}

export default page


