import { ReactLenis } from "lenis/react";
import HelixSliderComp from "./HelixSliderComp";

export default function HelixSlider() {
   return (
      <>
         <ReactLenis root options={{ infinite: true, syncTouch: true }}>
            <main>
               <HelixSliderComp
                  cardWidth={210}
                  cardHeight={290}
                  verticalSpacing={105}
                  snakeAmplitude={340}
                  snakeTightness={1}
                  depthAmplitude={200}
                  scrollDistance={360}
                  perspective={1900}
                  scaleMin={0.72}
                  yRotateStrength={1.0}
                  maxYRotation={0}
               />
            </main>
         </ReactLenis>
      </>
   );
}
