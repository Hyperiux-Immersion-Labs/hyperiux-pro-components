import GooeyCounter from '@/components/gooey-counter'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import React from'react'
import { getDemoPageMetadata } from "@/lib/demo-metadata";


const page = () => {
 return (
    <>
    <DemoHeader />
 <GooeyCounter/>
    </>
 )
}

export default page

export async function generateMetadata() {
  return getDemoPageMetadata("gooey-counter");
}
