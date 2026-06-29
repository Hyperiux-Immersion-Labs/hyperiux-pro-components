
import MaskTextWrapper from './MaskTextWrapper'
import { ReactLenis } from "lenis/react";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import ScrollBottom from "@/components/WebsiteComps/ScrollBottom";

const page = () => {
  return (
    <>
    <ReactLenis root>
      <DemoHeader />
      <ScrollBottom textColor='text-black' className="bottom-[3%] gap-[0.5vw] z-20"  />
      <MaskTextWrapper />
          </ReactLenis>
    </>
  )
}

export default page