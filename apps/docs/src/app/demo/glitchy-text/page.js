import GlitchyText from '@/components/glitchy-text'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import SplitLine from '@/components/WebsiteComps/SplitLine'
import React from 'react'

const page = () => {
  return (
   <>
   <DemoHeader logoColor='#FFFFFF'/>
   <GlitchyText/>
   <SplitLine
             as="p"
             start="top 120%"
className='absolute bottom-[5%] text-center left-1/2 -translate-x-1/2'>
       Click on the button to run the animation
  
   </SplitLine>
   </>
  )
}

export default page