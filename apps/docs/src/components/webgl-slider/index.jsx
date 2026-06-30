import React from'react'
import { ReactLenis } from'lenis/react'
import WebGLSliderComp from './WebGLSliderComp';

const P = "/api/media-proxy?url=";
const B = "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images";

const images = [
 { src:`${P}${B}/h-06.jpg`, text:"PR.00\n /10" },
 { src:`${P}${B}/h-09.jpg`, text:"PR.01\n /10" },
 { src:`${P}${B}/h-10.jpg`, text:"PR.02\n /10" },
 { src:`${P}${B}/h-11.jpg`, text:"PR.03\n /10" },
 { src:`${P}${B}/h-08.jpg`, text:"PR.04\n /10" },
 { src:`${P}${B}/h-13.jpg`, text:"PR.05\n /10" },
 { src:`${P}${B}/h-14.jpg`, text:"PR.06\n /10" },
 { src:`${P}${B}/h-15.jpg`, text:"PR.07\n /10" },
 { src:`${P}${B}/h-01.jpg`, text:"PR.08\n /10" },
 { src:`${P}${B}/h-02.jpg`, text:"PR.09\n /10" },
 { src:`${P}${B}/h-03.jpg`, text:"PR.10\n /10" },
];

const WebGLSlider = () => {
 return (
 <ReactLenis root options={{  infinite: true,  autoRaf: true,  duration: 1.5,  lerp: 0.075  }}>
 <WebGLSliderComp images={images} />
 </ReactLenis>
 )
}

export default WebGLSlider;
