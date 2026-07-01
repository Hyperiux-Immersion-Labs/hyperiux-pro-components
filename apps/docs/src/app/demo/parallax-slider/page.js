import React from'react'
import LenisSmoothScroll from'@/components/SmoothScroll/LenisScroll'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import ParallaxImgSlider from '@/components/parallax-slider'
import { getDemoPageMetadata } from "@/lib/demo-metadata";


const page = () => {
 return (
 <>
 <DemoHeader logoColor='#ffffff' textColor='#ffffff' />
 <LenisSmoothScroll />
 <ParallaxImgSlider images={[
'https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-01.jpg',
'https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-02.jpg',
'https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-03.jpg',
'https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-07.jpg',
'https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-05.jpg',
'https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-06.jpg',
'https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-07.jpg',
'https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-08.jpg',
 ]} bgColor='#111111' />
 </>
 )
}

export default page

export async function generateMetadata() {
  return getDemoPageMetadata("parallax-slider");
}
