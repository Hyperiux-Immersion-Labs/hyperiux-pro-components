import PerspectiveTextWrapper from './PerspectiveTextWrapper'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import ScrollBottom from '@/components/WebsiteComps/ScrollBottom'
import { getDemoPageMetadata } from "@/lib/demo-metadata";


const page = () => {
  return (
    <>
     <DemoHeader logoColor="#ffffff" textColor="#ffffff" />
      <ScrollBottom textColor='#ffffff' />
      <PerspectiveTextWrapper />
    </>
  )
}

export default page
export async function generateMetadata() {
  return getDemoPageMetadata("perspective-text-reveal");
}
