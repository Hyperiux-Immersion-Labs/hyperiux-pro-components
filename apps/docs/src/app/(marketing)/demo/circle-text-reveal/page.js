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
 <p className="pointer-events-none absolute bottom-8 left-1/2 z-20 max-[1025px]:hidden max-w-105 -translate-x-1/2 px-6 text-center font-mono text-sm leading-relaxed text-black/55 ">
 Hover across the headline and let the circle uncover what stayed quiet.
 </p>
 </div>
 </>
 )
}


export default page

export async function generateMetadata() {
  return getDemoPageMetadata("circle-text-reveal");
}
