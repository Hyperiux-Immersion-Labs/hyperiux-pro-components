import DirectionalMenu from '@/components/directional-menu'
import React from 'react'
import { getDemoPageMetadata } from "@/lib/demo-metadata";


const page = () => {
  return (
   <DirectionalMenu/>
  )
}

export default page
export async function generateMetadata() {
  return getDemoPageMetadata("directional-menu");
}
