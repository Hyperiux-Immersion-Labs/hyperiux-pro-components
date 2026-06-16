import React from'react'
import { ReactLenis } from'lenis/react'
import ScrollBottom from '@/components/WebsiteComps/ScrollBottom'
import CircularSlider from '@/components/circular-slider'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'

const page = () => {
 return (
 <>

 <ReactLenis root>
    <DemoHeader textColor='#ffffff' logoColor='#ffffff' />
<CircularSlider/>
<ScrollBottom className="bottom-[3.5%]" />
 </ReactLenis>
 </>
 )
}

export default page


