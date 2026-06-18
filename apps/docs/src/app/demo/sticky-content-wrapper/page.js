import StickyContentWrapper from "@/components/sticky-content-wrapper";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import { ReactLenis } from"lenis/react";

export default function Page() {
 return (
     <ReactLenis root>
        <DemoHeader/>
 <StickyContentWrapper />
     </ReactLenis>
 );
}
