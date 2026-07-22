import StickyContentWrapper from "@/components/sticky-content-wrapper";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import ScrollBottom from "@/components/WebsiteComps/ScrollBottom";
import { ReactLenis } from "lenis/react";
import { getDemoPageMetadata } from "@/lib/demo-metadata";


export default function Page() {
 return (
     <ReactLenis root>
        <DemoHeader/>
 <StickyContentWrapper />
 <ScrollBottom className="bottom-[3%] left-[20%]! gap-[1vw] max-sm:left-1/2!" textColor='text-[#111111]' />
     </ReactLenis>
 );
}

export async function generateMetadata() {
  return getDemoPageMetadata("sticky-content-wrapper");
}
