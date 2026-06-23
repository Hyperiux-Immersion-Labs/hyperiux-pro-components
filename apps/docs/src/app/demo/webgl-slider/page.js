import React from'react'
import { WebglSlider as WebGLProjectSlider } from'@/components/Slider/WebGLSlider'
import { ReactLenis } from'lenis/react'
import'lenis/dist/lenis.css'

const images = [
 { src:"https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-06.jpg", text:"PR.00\n /10" },
 { src:"https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-09.jpg", text:"PR.01\n /10" },
 { src:"https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-10.jpg", text:"PR.02\n /10" },
 { src:"https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-11.jpg", text:"PR.03\n /10" },
 { src:"https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-08.jpg", text:"PR.04\n /10" },
 { src:"https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-13.jpg", text:"PR.05\n /10" },
 { src:"https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-14.jpg", text:"PR.06\n /10" },
 { src:"https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-15.jpg", text:"PR.07\n /10" },
 { src:"https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-01.jpg", text:"PR.08\n /10" },
 { src:"https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-02.jpg", text:"PR.09\n /10" },
 { src:"https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-03.jpg", text:"PR.10\n /10" },
];

const page = () => {
 return (
 <ReactLenis root options={{  infinite: true,  autoRaf: true,  duration: 1.5,  lerp: 0.075  }}>
 <WebGLProjectSlider images={images} />
 </ReactLenis>
 )
}

export default page
