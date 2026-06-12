
// import ScrollDistortion from '@/components/scroll-distortion'
import ScrollDistortion from '@/components/scroll-distortion'
import DemoHeader from '@/components/WebsiteComps/DemoHeader'
import ScrollBottom from '@/components/WebsiteComps/ScrollBottom'
import React from'react'

const sections = [
 { text:'SHADOW', src:'https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-07.jpg' },
 { text:'FLOWER', src:'https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-10.jpg' },
 { text:'RUN!!', src:'https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-02.jpg' },
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
    <DemoHeader logoColor="text-white"/>
    <ScrollDistortion
    sections={sections}
    shaderConfig={shaderConfig}
    displacementSrc="https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/distortion-noise.jpg"
    />
    <ScrollBottom textColor={"text-white"}/>
    
    </>
 )
}
