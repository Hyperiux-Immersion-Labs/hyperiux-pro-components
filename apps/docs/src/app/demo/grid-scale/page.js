import GridScale from '@/components/grid-scale'
import LenisSmoothScroll from '@/components/SmoothScroll/LenisScroll'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import ScrollBottom from '@/components/WebsiteComps/ScrollBottom'
import { getDemoPageMetadata } from "@/lib/demo-metadata";


const page = () => {
  return (
    <>
    <LenisSmoothScroll />
    <DemoHeader textColor='#ffffff' logoColor='#ffffff' />
    <GridScale/>
    <ScrollBottom/>
    </>
  )
}

export default page
export async function generateMetadata() {
  return getDemoPageMetadata("grid-scale");
}
