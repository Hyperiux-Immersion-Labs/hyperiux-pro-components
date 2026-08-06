
import HelixSlider  from '@/components/helix-slider'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import ScrollBottom from '@/components/WebsiteComps/ScrollBottom'
import { getDemoPageMetadata } from "@/lib/demo-metadata";


const page = () => {
  return (
    <>
    <DemoHeader logoColor='#FFFFFF' textColor='#ffffff'  />
   <HelixSlider />
   <ScrollBottom className='z-90 bottom-[5%] gap-[0.5vw] ' textColor={'text-white'} />
    </>
  )
}

export default page
export async function generateMetadata() {
  return getDemoPageMetadata("helix-slider");
}
