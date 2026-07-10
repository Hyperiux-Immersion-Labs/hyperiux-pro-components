import ScrambleTextWrapper from './ScrambleTextWrapper'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import ScrollBottom from '@/components/WebsiteComps/ScrollBottom'
import { getDemoPageMetadata } from "@/lib/demo-metadata";


const page = () => {
  return (
    <>
    <DemoHeader />
    <ScrambleTextWrapper/>
    <ScrollBottom textColor='text-black' />
    </>
  )
}

export default page
export async function generateMetadata() {
  return getDemoPageMetadata("scramble-text");
}
