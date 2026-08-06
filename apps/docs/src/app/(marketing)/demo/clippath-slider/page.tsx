import ClipPathSlider from '@/components/clip-path-slider'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import { getDemoPageMetadata } from "@/lib/demo-metadata";


const Page = () => {
 return (
 <>
 <DemoHeader logoColor='#FFFFFF' textColor='white' />
 <ClipPathSlider/>
 </>
 )
}

export default Page



export async function generateMetadata() {
  return getDemoPageMetadata("clippath-slider");
}
