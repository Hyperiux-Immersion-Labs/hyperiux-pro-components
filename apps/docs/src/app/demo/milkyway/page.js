import MilkyWay from "@/components/milkyway"
import { getDemoPageMetadata } from "@/lib/demo-metadata";


const page = () => {
  return (
    <>
   <MilkyWay />
    </>
  )
}

export default page

export async function generateMetadata() {
  return getDemoPageMetadata("milkyway");
}
