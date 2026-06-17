import React from'react'
import LenisSmoothScroll from'@/components/SmoothScroll/LenisScroll'
import TextConvergence from '@/components/text-convergence'

const page = () => {
 return (
 <>
 <LenisSmoothScroll />
 <TextConvergence
 text="Build faster. Animate better. Ship smarter. Hyperiux Vault gives you the tools to create high-performance interfaces that look premium and feel effortless."
 bgColor="bg-[#111111]"
 textColor="text-[#ffffff]"
 />
 </>
 )
}

export default page