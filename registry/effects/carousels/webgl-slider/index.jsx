import React from'react'
import { ReactLenis } from'lenis/react'
import WebGLSliderComp from './WebGLSliderComp';

const images = [
 { src:"https://picsum.photos/seed/wgl0/800/1200", text:"PR.00\n /10" },
 { src:"https://picsum.photos/seed/wgl1/800/1200", text:"PR.01\n /10" },
 { src:"https://picsum.photos/seed/wgl2/800/1200", text:"PR.02\n /10" },
 { src:"https://picsum.photos/seed/wgl3/800/1200", text:"PR.03\n /10" },
 { src:"https://picsum.photos/seed/wgl4/800/1200", text:"PR.04\n /10" },
 { src:"https://picsum.photos/seed/wgl5/800/1200", text:"PR.05\n /10" },
 { src:"https://picsum.photos/seed/wgl6/800/1200", text:"PR.06\n /10" },
 { src:"https://picsum.photos/seed/wgl7/800/1200", text:"PR.07\n /10" },
 { src:"https://picsum.photos/seed/wgl8/800/1200", text:"PR.08\n /10" },
 { src:"https://picsum.photos/seed/wgl9/800/1200", text:"PR.09\n /10" },
 { src:"https://picsum.photos/seed/wgl10/800/1200", text:"PR.10\n /10" },
];

const WebGLSlider = () => {
 return (
 <ReactLenis root options={{  infinite: true,  autoRaf: true,  duration: 1.5,  lerp: 0.075  }}>
 <WebGLSliderComp images={images} />
 </ReactLenis>
 )
}

export default WebGLSlider;
