// Built using Hyperiux Vault: https://vault.hyperiux.com

import { ReactLenis } from "lenis/react";
import HelixSliderComp from "./HelixSliderComp";

export default function HelixSlider({
   snakeAmplitude = 340,
   depthAmplitude = 200,
   perspective = 1900,
   scaleMin = 0.72,
   maxYRotation = 0,
}) {
   return (
      <>
         <ReactLenis root options={{ infinite: true, syncTouch: true }}>
            <main>
               <HelixSliderComp
                  cardWidth={210}
                  cardHeight={290}
                  verticalSpacing={105}
                  snakeAmplitude={snakeAmplitude}
                  snakeTightness={1}
                  depthAmplitude={depthAmplitude}
                  perspective={perspective}
                  scaleMin={scaleMin}
                  yRotateStrength={1.0}
                  maxYRotation={maxYRotation}
               />
            </main>
         </ReactLenis>
      </>
   );
}
