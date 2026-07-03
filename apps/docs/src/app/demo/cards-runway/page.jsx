import CardsRunway from '@/components/cards-runway'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import ScrollBottom from '@/components/WebsiteComps/ScrollBottom'
import React from 'react'

const Page = () => {
  return (
    <>
    <DemoHeader logoColor='#ffffff' textColor='#ffffff' />
    <h2 className="text-[4vw] fixed top-[5vw] max-sm:top-[20vw] max-sm:text-[10vw] max-md:top-[20vw] inset-x-0 max-md:text-[6vw] mx-auto w-[90vw] text-center text-white z-30 pointer-events-none">
      Cards Runway
    </h2>
    <CardsRunway />
    <ScrollBottom textColor="#ffffff" className='top-[11vw] gap-[0.5vw] max-md:hidden' />
     
    </>
  )
}

export default Page