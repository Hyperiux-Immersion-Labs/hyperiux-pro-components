import React from'react'
import LenisSmoothScroll from'@/components/SmoothScroll/LenisScroll'
import ParallaxSlider from '@/components/parallax-slider'

const page = () => {
 return (
 <>
 <LenisSmoothScroll />
 <ParallaxSlider images={[
'https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-01.jpg',
'https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-02.jpg',
'https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-03.jpg',
'https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-07.jpg',
'https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-05.jpg',
'https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-06.jpg',
'/assets/nature/nature13.png',
'/assets/nature/nature14.png',
 ]} bgColor='#111111' />
 </>
 )
}

export default page
