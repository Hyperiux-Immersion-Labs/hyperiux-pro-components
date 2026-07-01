import DottedGrid from '@/components/dotted-grid';
import DemoHeader from '@/components/WebsiteComps/DemoHeader';
import React from 'react'
import { getDemoPageMetadata } from "@/lib/demo-metadata";


const Page = () => {
    return (
        <>
        <DemoHeader logoColor='#ffffff' textColor='#ffffff' />
        <DottedGrid />
        </>
    )
}

export default Page;

export async function generateMetadata() {
  return getDemoPageMetadata("dotted-grid");
}
