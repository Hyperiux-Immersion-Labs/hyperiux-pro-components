
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import LiquidGlassWrapper from './LiquidGlassWrapper'
import { getDemoPageMetadata } from "@/lib/demo-metadata";


const page = () => {
  return (
    <>
    <DemoHeader />
    <LiquidGlassWrapper />
    </>
  )
}

export default page
export async function generateMetadata() {
  return getDemoPageMetadata("liquid-glass-cursor");
}
