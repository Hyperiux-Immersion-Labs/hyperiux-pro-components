
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import CardDrift from '@/components/card-drift'
import { getDemoPageMetadata } from "@/lib/demo-metadata";



const page = () => {
 return (
 <>
 <DemoHeader logoColor='#ffffff' textColor='white'/>
 <CardDrift/>
 </>
 )
}

export default page



export async function generateMetadata() {
  return getDemoPageMetadata("card-drift");
}
