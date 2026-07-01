import Form from '@/components/form-comp'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import React from 'react'
import { getDemoPageMetadata } from "@/lib/demo-metadata";


const page = () => {
  return (
    <>
    <DemoHeader />
    <Form />
    </>
  )
}

export default page
export async function generateMetadata() {
  return getDemoPageMetadata("form");
}
