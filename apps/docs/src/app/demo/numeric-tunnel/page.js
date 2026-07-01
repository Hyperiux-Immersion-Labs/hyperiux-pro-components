import NumericTunnel from '@/components/numeric-tunnel'
import React from 'react'
import { getDemoPageMetadata } from "@/lib/demo-metadata";


const page = () => {
  return (
    <NumericTunnel />
  )
}

export default page
export async function generateMetadata() {
  return getDemoPageMetadata("numeric-tunnel");
}
