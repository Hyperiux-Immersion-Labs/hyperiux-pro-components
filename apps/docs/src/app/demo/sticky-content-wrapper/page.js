import DemoHeader from "@/components/DemoHeader";
import { StickyContent } from "@/components/sticky-content-wrapper";
import { ReactLenis } from"lenis/react";

export default function Page() {
 return (
     <ReactLenis root>
        <DemoHeader
        
        />

 <StickyContent />
     </ReactLenis>
 );
}
