import CoffeeBeanCursor from '@/components/coffee-bean-cursor'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import React from 'react'
import { getDemoPageMetadata } from "@/lib/demo-metadata";


const page = () => {
  return (
    <>
    <DemoHeader textColor='#ffffff' logoColor='#FFFFFF' />
     <p className="pointer-events-none absolute bottom-8 max-[1025px]:hidden left-1/2 z-10  max-w-130 -translate-x-1/2 px-6 text-center font-mono text-sm leading-relaxed text-[#ffd4a3]/80 [text-shadow:0_3px_18px_rgba(0,0,0,0.85)] ">
       Stir the air with your cursor - the beans drift, and the light follows like warm espresso steam.
     </p>
     <div className="absolute max-[1025px]:block hidden top-30 left-1/2 -translate-x-1/2 text-center w-full z-10 pointer-events-none">
       <p className="font-serif text-[#ffd4a3] opacity-80 max-[1025px]:text-[4vw] max-md:text-[6vw] leading-none">
         Touch to see effect
       </p>
       <p className="text-[#ffd4a3] opacity-60 leading-none max-[1025px]:text-[2.5vw] max-md:text-[3.5vw] mt-2">
         Open in desktop for better experience
       </p>
     </div>
    <CoffeeBeanCursor />
    </>
  )
}

export default page
export async function generateMetadata() {
  return getDemoPageMetadata("coffee-bean-cursor");
}
