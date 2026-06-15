import React from'react'
import { ReactLenis } from'lenis/react'
import ScrollBottom from '@/components/WebsiteComps/ScrollBottom'
import CircularSlider from '@/components/CircularSlider'

const page = () => {
 return (
 <>
 <ReactLenis root>
<CircularSlider/>
<ScrollBottom className="bottom-[3.5%]" />
 </ReactLenis>
 </>
 )
}

export default page


