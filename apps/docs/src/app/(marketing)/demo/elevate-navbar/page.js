import ElevateNavbar from '@/components/elevate-navbar'
import React from 'react'
import { getDemoPageMetadata } from "@/lib/demo-metadata";


const page = () => {
  return (
    <>
    <ElevateNavbar/>
    </>
  )
}

export default page
export async function generateMetadata() {
  return getDemoPageMetadata("elevate-navbar");
}
