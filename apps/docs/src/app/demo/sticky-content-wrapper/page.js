import StickyContentWrapper from "@/components/sticky-content-wrapper";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import ScrollBottom from "@/components/WebsiteComps/ScrollBottom";
import { ReactLenis } from"lenis/react";

export default function Page() {
 return (
     <ReactLenis root>
        <DemoHeader/>
 <StickyContentWrapper />
 <ScrollBottom className="bottom-[5%] left-[20%]! gap-[1vw]" textColor='text-[#111111]' />
     </ReactLenis>
 );
}
