import GlitchyText from '@/components/glitchy-text'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import React from 'react'

const page = () => {
  return (
   <>
   <DemoHeader logoColor='#FFFFFF'/>
   <GlitchyText/>
    <p className='absolute bottom-[5%] left-1/2 -translate-x-1/2'>
       Click on the button to run the animation
    </p>
   </>
  )
}

export default page