
import SlideTextWrapper from './SlideTextWrapper'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import ScrollBottom from '@/components/WebsiteComps/ScrollBottom'
import { getDemoPageMetadata } from "@/lib/demo-metadata";


const page = () => {
  return (
   <>
   <DemoHeader textColor='#ffffff' logoColor='#FFFFFF' />
    <SlideTextWrapper />
    <ScrollBottom />
   </>
  )
}

export default page
export async function generateMetadata() {
  return getDemoPageMetadata("slide-text-reveal");
}
