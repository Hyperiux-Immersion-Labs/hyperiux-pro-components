
// import ScrollDistortion from '@/components/scroll-distortion'
import ScrollDistortion from '@/components/scroll-distortion'
import ScrollBottom from '@/components/WebsiteComps/ScrollBottom'
import React from'react'

const sections = [
 { text:'SHADOW', src:'/assets/img/image01.webp' },
 { text:'FLOWER', src:'/assets/img/image02.webp' },
 { text:'RUN!!', src:'/assets/img/image03.webp' },
]

const shaderConfig = {
 strength: 0.8,
 rgbShift: 0.05,
 scale: 0.15,
 transitionDuration: 0.8,
 transitionEase:'power3.inOut',
}

export default function page() {
 return (
    <>
    <ScrollDistortion
    sections={sections}
    shaderConfig={shaderConfig}
    displacementSrc="/assets/img/distortion.jpg"
    />
    <ScrollBottom textColor={"text-white"}/>
    
    </>
 )
}
