import GridScale from '@/components/grid-scale'
import LenisSmoothScroll from '@/components/SmoothScroll/LenisScroll'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import ScrollBottom from '@/components/WebsiteComps/ScrollBottom'
import { getDemoPageMetadata } from "@/lib/demo-metadata";


const page = () => {
  return (
    <>
    <LenisSmoothScroll />
    <DemoHeader textColor='#ffffff' logoColor='#FFFFFF' />
    <GridScale/>
    <ScrollBottom textColor="text-[#5a5a5a]" className="bottom-[3%]"/>
    </>
  )
}

export default page
export async function generateMetadata() {
  return getDemoPageMetadata("grid-scale");
}
