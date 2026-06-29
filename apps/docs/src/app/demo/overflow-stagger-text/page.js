import React from 'react'
import OverflowStaggerWrapper from './OverflowStaggerWrapper'
import { ReactLenis } from "lenis/react";
import ScrollBottom from "@/components/WebsiteComps/ScrollBottom";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";

const page = () => {
  return (
    <>
          <ReactLenis root>
      <DemoHeader />
      <OverflowStaggerWrapper />
       <ScrollBottom textColor={"text-[#151515]"}/>
        </ReactLenis>
    </>
  )
}

export default page