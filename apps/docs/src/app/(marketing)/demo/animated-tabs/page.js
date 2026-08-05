import AnimatedTabs from '@/components/animated-tabs';
import HeadAnim from '@/components/Animations/HeadAnim'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import SplitLine from '@/components/WebsiteComps/SplitLine'
import { getDemoPageMetadata } from "@/lib/demo-metadata";


const Page = () => {
  return (
   <>
   <DemoHeader/>
      <div className=" h-full flex flex-col items-center gap-[1vw] bg-white text-[#111111] px-[5vw] pt-[7%] max-[1025px]:pt-[15%] max-md:pt-[30%] inset-0 z-1">
           <HeadAnim>
           <h1 className="text-[4vw] max-[1025px]:text-[7vw] max-md:text-[9vw] ">
             Animated Tabs
           </h1>
           </HeadAnim>
           <SplitLine>
           <p className='text-center  max-[1025px]:w-[80vw]'>
               Click on the labels to change the tab.
           </p>
           </SplitLine>
          
         </div>
         <div className='max-[1025px]:mt-[-2vw]'>

   <AnimatedTabs/>
         </div>
   </>
  )
}

export default Page
export async function generateMetadata() {
  return getDemoPageMetadata("animated-tabs");
}
