
import ProgressiveBloomValley from "@/components/progressive-bloom-valley";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import ScrollBottom from "@/components/WebsiteComps/ScrollBottom";
import { getDemoPageMetadata } from "@/lib/demo-metadata";


export default function page() {
 return (
 <>
 <DemoHeader textColor="#ffffff" logoColor='#FFFFFF' />
<ProgressiveBloomValley/>
<h1 className="sr-only">Progressive Bloom Valley</h1>
 <ScrollBottom/>
 </>

 );
}

export async function generateMetadata() {
  return getDemoPageMetadata("progressive-bloom-valley");
}
