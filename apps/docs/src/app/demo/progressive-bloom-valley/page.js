
import ProgressiveBloomValley from "@/components/progressive-bloom-valley";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import ScrollBottom from "@/components/WebsiteComps/ScrollBottom";
import { getDemoPageMetadata } from "@/lib/demo-metadata";


export default function page() {
 return (
 <>
 <DemoHeader textColor="#ffffff" logoColor="#ffffff" />
<ProgressiveBloomValley/>
 <ScrollBottom/>
 </>

 );
}

export async function generateMetadata() {
  return getDemoPageMetadata("progressive-bloom-valley");
}
