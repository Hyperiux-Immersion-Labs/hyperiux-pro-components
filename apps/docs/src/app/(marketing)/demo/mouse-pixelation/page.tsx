import MousePixelation from '@/components/mouse-pixelation'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import React from 'react'
import { getDemoPageMetadata } from "@/lib/demo-metadata";


const page = () => {
  return (
    <>
    <DemoHeader logoColor='#FFFFFF' textColor='white'/>
    <MousePixelation variant={"pixel-circle"} imageUrl={"https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-02.jpg"}/>
  </>
  )
}

export default page

export async function generateMetadata() {
  return getDemoPageMetadata("mouse-pixelation");
}
