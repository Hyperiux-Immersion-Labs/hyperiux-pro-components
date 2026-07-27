import InteractiveListPreview from '@/components/interactive-list-preview'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import React from 'react'
import { getDemoPageMetadata } from "@/lib/demo-metadata";


const page = () => {
  return (
    <>
    <DemoHeader textColor='#ffffff' logoColor='#FFFFFF' />
    <InteractiveListPreview/>
    </>
  )
}

export default page
export async function generateMetadata() {
  return getDemoPageMetadata("interactive-list-preview");
}
