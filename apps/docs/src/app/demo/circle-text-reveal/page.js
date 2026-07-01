import React from'react'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import CircleTextReveal from '@/components/circle-text-reveal'
import { getDemoPageMetadata } from "@/lib/demo-metadata";


const page = () => {
 return (
 <>
 <DemoHeader/>
 <div className="relative">
 <CircleTextReveal
 textColor="#111"
 Text="Some ideas only bloom when you move toward them."
 revealText="The hidden layer has been waiting for your cursor."
 circleColorBg="#ff5f00"
 RevealedTextColor="#ffffff"
 />
 <p className="pointer-events-none absolute bottom-8 left-1/2 z-20 max-md:hidden max-w-105 -translate-x-1/2 px-6 text-center font-mono text-sm leading-relaxed text-black/55 ">
 Hover across the headline and let the circle uncover what stayed quiet.
 </p>
 <p className="pointer-events-none absolute max-md:bottom-15 max-sm:bottom-9 left-1/2 z-20 max-w-[320px] -translate-x-1/2 px-6 text-center leading-[1.3] font-mono max-md:text-lg max-sm:text-sm  text-black/55 hidden max-md:block">
 Open on desktop to view the effect.
 </p>
 </div>
 </>
 )
}


export default page

export async function generateMetadata() {
  return getDemoPageMetadata("circle-text-reveal");
}
