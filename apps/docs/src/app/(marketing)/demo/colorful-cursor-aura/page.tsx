
import LenisSmoothScroll from '@/components/SmoothScroll/LenisScroll'
import ColorfulCursorAura from '@/components/colorful-cursor-aura'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import SplitLine from '@/components/WebsiteComps/SplitLine';


const Page = () => {
  return (
    <>
    <DemoHeader />
      <LenisSmoothScroll />
   <ColorfulCursorAura/>
   <div className="hidden max-[1025px]:block absolute top-[80%] left-1/2 -translate-x-1/2 text-center">
   <SplitLine>

        <p className="text-zinc-700 max-[1025px]:text-[3vw] max-md:text-[4vw] leading-[1.2] font-medium">
           Open on desktop to experience the effect
        </p>
   </SplitLine>
      </div>
    </>
  )
}

export default Page
export async function generateMetadata() {
  return getDemoPageMetadata("colorful-cursor-aura");
}
