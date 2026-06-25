import StackingCards from '@/components/stacking-cards'
import ScrollBottom from '@/components/WebsiteComps/ScrollBottom'
import React from 'react'

const page = () => {
  return (
   <>
   <StackingCards/>
   <ScrollBottom textColor={"text-[#111111]"} className='bottom-[1%]'/>
   </>
  )
}

export default page