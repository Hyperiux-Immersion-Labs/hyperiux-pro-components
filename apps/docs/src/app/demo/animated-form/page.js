import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import React from 'react'
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import AnimatedForm from '@/components/animated-form';


const page = () => {
  return (
    <>
    <DemoHeader />
    <AnimatedForm/>
    </>
  )
}

export default page
export async function generateMetadata() {
  return getDemoPageMetadata("animated-form");
}
