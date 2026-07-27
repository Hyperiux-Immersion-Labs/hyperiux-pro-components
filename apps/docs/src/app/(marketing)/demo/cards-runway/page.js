import CardsRunway from '@/components/cards-runway'
import LenisSmoothScroll from '@/components/SmoothScroll/LenisScroll'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import ScrollBottom from '@/components/WebsiteComps/ScrollBottom'
import { getDemoPageMetadata } from '@/lib/demo-metadata'
import React from 'react'

const Page = () => {
  return (
    <>
    <DemoHeader logoColor='#FFFFFF' textColor='#ffffff' />
    <LenisSmoothScroll />
    <h1 className="text-[4vw] fixed top-[6vw] max-sm:top-[22vw] max-sm:text-[10vw] max-md:top-[20vw] inset-x-0 max-md:text-[6vw] mx-auto w-[90vw] text-center text-white z-30 pointer-events-none">
      Cards Runway
    </h1>
    <p className='fixed bottom-[5%] hidden max-md:block translate-x-[-50%] left-1/2 text-center text-white z-30 text-lg'>
        Drag
    </p>
    <CardsRunway />
    <ScrollBottom textColor="#ffffff" className='top-[11vw] gap-[0.5vw] max-md:hidden' />
     
    </>
  )
}

export default Page

export async function generateMetadata() {
  return getDemoPageMetadata("cards-runway");
}