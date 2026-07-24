import React from 'react'
import BookFlip from '@/components/book-flip'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import { getDemoPageMetadata } from "@/lib/demo-metadata";


const page = () => {
  return (
    <>
    <DemoHeader textColor='#fffff' logoColor='#FFFFFF' />
      <BookFlip />
    </>
  )
}

export default page
export async function generateMetadata() {
  return getDemoPageMetadata("book-flip");
}
