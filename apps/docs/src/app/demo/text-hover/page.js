import HeadAnim from '@/components/Animations/HeadAnim'
import TextHover from '@/components/text-hover'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import SplitLine from '@/components/WebsiteComps/SplitLine'
import { getDemoPageMetadata } from "@/lib/demo-metadata";

const page = () => {
  return (
   <>
   <DemoHeader logoColor='#ffffff' textColor='#ffffff'/>
   <div className='w-full h-full flex flex-col bg-[#0a0a0a] items-center gap-[2vw] px-[5vw] pt-[10%] max-md:pt-[15%] max-sm:pt-[30%]'>
    <HeadAnim>
    <h1 className='text-[4vw] max-md:text-[7vw] max-sm:text-[9vw]'>
       Text Hover
    </h1>

    </HeadAnim>
    <div className='w-[50%] text-center max-md:hidden'>
    <SplitLine>
    <p>
      &quot;Text Hover&quot; is a component, where you can hover on the particular label and a frame and content regarding that label just appears smoothly.
    </p>
    </SplitLine>

    </div>
    <div className='w-[90%] text-center hidden max-md:block'>

    <SplitLine>
    <p className=''>
      &quot;Text Hover&quot; is a component, where you can click on the particular label and a frame and content regarding that label just appears smoothly.
    </p>
    </SplitLine>
    </div>

   </div>
   <TextHover/>
   
   </>
  )
}

export default page
export async function generateMetadata() {
  return getDemoPageMetadata("text-hover");
}
