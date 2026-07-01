import ExpandingNavbar from '@/components/expanding-navbar'
import { getDemoPageMetadata } from "@/lib/demo-metadata";


const Page = () => {
  return (
    <ExpandingNavbar />
  )
}

export default Page
export async function generateMetadata() {
  return getDemoPageMetadata("expanding-navbar");
}
