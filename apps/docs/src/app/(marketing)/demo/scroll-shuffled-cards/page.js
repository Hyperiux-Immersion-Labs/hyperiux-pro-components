import ScrollShuffledCards from '@/components/scroll-shuffled-cards'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import ScrollBottom from '@/components/WebsiteComps/ScrollBottom'
import { ReactLenis } from "lenis/react";
import { getDemoPageMetadata } from "@/lib/demo-metadata";


const page = () => {
  return (
    <>
      <ReactLenis root>

        <DemoHeader />
        <ScrollShuffledCards />

        <ScrollBottom as='p' textColor={'text-[#111111]'} />
      </ReactLenis>
    </>
  )
}

export default page
export async function generateMetadata() {
  return getDemoPageMetadata("scroll-shuffled-cards");
}
