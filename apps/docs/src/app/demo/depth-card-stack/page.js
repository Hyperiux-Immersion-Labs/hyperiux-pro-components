import DepthCardStack from '@/components/depth-card-stack'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import { getDemoPageMetadata } from "@/lib/demo-metadata";


const Page = () => {
 return (
 <>
 <DemoHeader />
 <DepthCardStack/>
 </>
 )
}

export default Page

export async function generateMetadata() {
  return getDemoPageMetadata("depth-card-stack");
}
