import React from 'react'
import MagneticImageTrail from '@/components/magnetic-image-trail'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'

const page = () => {
  return (
    <>
    <div className='h-screen relative'>

      <DemoHeader />
      <MagneticImageTrail />
      <div className='absolute top-24 max-md:hidden right-10 backdrop-blur-md p-4 rounded-xl bg-black/5 max-w-45'>
        <p className='text-black text-lg text-center leading-[1.2]'>
          Glide around to reveal the magic
        </p>

      </div>
    </div>
    </>
  )
}

export default page