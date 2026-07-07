import Counter from '@/components/Counter'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import React from 'react'
import { getDemoPageMetadata } from "@/lib/demo-metadata";


const page = () => {
  return (
    <>
    <DemoHeader/>
    <Counter/>
    </>
  )
}

export default page
export async function generateMetadata() {
  return getDemoPageMetadata("counter");
}
