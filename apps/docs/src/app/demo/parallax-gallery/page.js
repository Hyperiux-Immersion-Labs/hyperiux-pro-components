import React from 'react'
import ParallaxGallery from '@/components/parallax-gallery'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import ScrollBottom from '@/components/WebsiteComps/ScrollBottom'

const page = () => {
  return (
    <>
    <DemoHeader logoColor='#ffffff' textColor='#ffffff' />
    <ParallaxGallery />
    <ScrollBottom textColor='#fffffff' className='bottom-[0.1%] max-md:bottom-[5%] gap-[0.2vw]' />
    </>
  )
}

export default page