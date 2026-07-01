import StackingCards from '@/components/stacking-cards'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import ScrollBottom from '@/components/WebsiteComps/ScrollBottom'
import { ReactLenis } from'lenis/react'
import { getDemoPageMetadata } from "@/lib/demo-metadata";


const page = () => {
  return (
   <>
   
    <ReactLenis root>
      <DemoHeader />

   <StackingCards/>
    </ReactLenis>
   <ScrollBottom textColor={"text-[#111111]"} className='bottom-[1%]'/>
   </>
  )
}

export default page
export async function generateMetadata() {
  return getDemoPageMetadata("stacking-cards");
}
