
import LenisSmoothScroll from '@/components/SmoothScroll/LenisScroll'
import ColorfulCursorAura from '@/components/colorful-cursor-aura'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import { getDemoPageMetadata } from "@/lib/demo-metadata";


const Page = () => {
  return (
    <>
    <DemoHeader />
      <LenisSmoothScroll />
   <ColorfulCursorAura/>
    </>
  )
}

export default Page
export async function generateMetadata() {
  return getDemoPageMetadata("colorful-cursor-aura");
}
