import SpiderParticles from '@/components/spider-particles'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import React from'react'
import { getDemoPageMetadata } from "@/lib/demo-metadata";


const spiderParticlesProps = {
 particleCount:180,
 gridGap:0,
 particleSize:20.0,
 mouseConnectDist:160,
 spotlightRadius:300,
 particlesGlow:false,
 glowColor:0xffffff,
 particleColor:0xffffff,
 webColor:0xffffff,
 centerColor:0xffffff,
}

const page = () => {
 return (
 <div>
    <DemoHeader logoColor='#FFFFFF' textColor='#ffffff' />
 <SpiderParticles {...spiderParticlesProps} />
 </div>
 )
}

export default page

export async function generateMetadata() {
  return getDemoPageMetadata("spider-particles");
}
