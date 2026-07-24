import MilkyWay from "@/components/milky-way"
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import { getDemoPageMetadata } from "@/lib/demo-metadata";


const page = () => {
  return (
    <>
    <DemoHeader logoColor='#FFFFFF' textColor="#FFFFFF"/>
   <MilkyWay />
    </>
  )
}

export default page

export async function generateMetadata() {
  return getDemoPageMetadata("milky-way");
}
