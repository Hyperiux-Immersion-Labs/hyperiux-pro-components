import ScrollShuffledCards from '@/components/scroll-shuffled-cards'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import ScrollBottom from '@/components/WebsiteComps/ScrollBottom'
import { ReactLenis } from"lenis/react";

const page = () => {
  return (
    <>
     <ReactLenis root>

    <DemoHeader/>
   <ScrollShuffledCards/>
   <ScrollBottom textColor={'text-[#111111]'}/>
     </ReactLenis>
    </>
  )
}

export default page