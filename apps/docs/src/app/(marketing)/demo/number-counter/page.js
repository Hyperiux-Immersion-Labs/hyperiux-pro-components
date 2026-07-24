import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import React from 'react'
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import NumberCounter from '@/components/number-counter';


const page = () => {
  return (
    <>
    <DemoHeader/>
    <NumberCounter/>
    </>
  )
}

export default page
export async function generateMetadata() {
  return getDemoPageMetadata("number-counter");
}
