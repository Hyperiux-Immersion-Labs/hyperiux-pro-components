
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import CardDrift from '@/components/card-drift'
import { getDemoPageMetadata } from "@/lib/demo-metadata";



const page = () => {
 return (
 <>
 <DemoHeader logoColor='#FFFFFF' textColor='white'/>
 <CardDrift/>
 <div className='absolute bottom-2 translate-x-[-50%] left-1/2  rounded-xl   text-white bg-white/10 px-4 py-2 max-md:bottom-5 text-center backdrop-blur-md'>
      Grab any card and move it around
 </div>
 </>
 )
}

export default page



export async function generateMetadata() {
  return getDemoPageMetadata("card-drift");
}
