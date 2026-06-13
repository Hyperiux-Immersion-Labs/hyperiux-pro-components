import MousePixelation, { PixelCircle } from '@/components/mouse-pixelation'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import React from 'react'

const page = () => {
  return (
    <>
    <DemoHeader logoColor="white"/>
    <MousePixelation variant={"pixel-circle"} imageUrl={"https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-16.jpg"}/>
  </>
  )
}

export default page
