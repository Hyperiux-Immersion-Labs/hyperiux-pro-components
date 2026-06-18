import React from'react'
import { TextFillAnimation } from'@/components/text-fill-animation'
import { ReactLenis } from'lenis/react'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import ScrollBottom from '@/components/WebsiteComps/ScrollBottom'


const page = () => {
 return (
 <>
 <ReactLenis root>
    <DemoHeader />

 <TextFillAnimation
 text="Design systems should feel effortless, not like you're fighting your own components every time you build."
 textSize="3vw"
 textWidth="60%"
 textColor="#111111"
 primaryColor='#ff6b00'
 dimColor="#AAAAAA"
 backgroundColor="#F0EFE9"
 id="hero-break"
 containerClassName=""
 mobileTextSize="8vw"
 mobileTextWidth="92%"
 tabletTextSize='6vw'
 tabletTextWidth='88%'
 />
 <ScrollBottom textColor='text-black' />
 </ReactLenis>
 </>
 )
}

export default page
