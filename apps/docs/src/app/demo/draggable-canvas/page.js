import DraggableCanvas from '@/components/draggable-canvas'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import React from 'react'
import { getDemoPageMetadata } from "@/lib/demo-metadata";


const page = () => {
  return (
    <>
    <DemoHeader textColor='#ffffff' logoColor='#ffffff' />
    <DraggableCanvas/>
    </>
  )
}

export default page
export async function generateMetadata() {
  return getDemoPageMetadata("draggable-canvas");
}
