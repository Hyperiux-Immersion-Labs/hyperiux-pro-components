import React from'react'
import LenisSmoothScroll from'@/components/SmoothScroll/LenisScroll'
import ParallaxSlider from '@/components/parallax-slider'

const page = () => {
 return (
 <>
 <LenisSmoothScroll />
 <ParallaxSlider images={[
'/assets/nature/nature06.png',
'/assets/nature/nature08.png',
'/assets/nature/nature09.png',
'/assets/nature/nature10.png',
'/assets/nature/nature11.png',
'/assets/nature/nature12.png',
'/assets/nature/nature13.png',
'/assets/nature/nature14.png',
 ]} bgColor='#111111' />
 </>
 )
}

export default page
