import HeadAnim from '@/components/Animations/HeadAnim'
import TestimonialSwiper from '@/components/testimonial-swiper'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import SplitLine from '@/components/WebsiteComps/SplitLine'
import React from 'react'
import { getDemoPageMetadata } from "@/lib/demo-metadata";


const page = () => {
  return (
   <>
   <DemoHeader/>
   <div className="w-full h-full flex flex-col items-center gap-[1vw] bg-[#edeae2] text-[#111111] px-[5vw] py-[7%] max-md:py-[15%] max-sm:py-[20%] inset-0 z-1">
        <HeadAnim>
        <h1 className="text-[4vw] max-md:text-[7vw] max-sm:text-[9vw] ">
          Testimonial Swiper
        </h1>
        </HeadAnim>
        <SplitLine>
        <p className='text-center max-md:w-[80vw]'>
            Click on the navigation buttons to change the testimonials.
        </p>
        </SplitLine>
       
      </div>
   <TestimonialSwiper/>
   </>
  )
}

export default page
export async function generateMetadata() {
  return getDemoPageMetadata("testimonial-swiper");
}
