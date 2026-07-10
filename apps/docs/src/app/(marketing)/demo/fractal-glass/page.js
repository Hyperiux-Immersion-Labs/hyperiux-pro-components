

import FractalGlass from "@/components/fractal-glass";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import { getDemoPageMetadata } from "@/lib/demo-metadata";


const images = {
  blob: "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-13.jpg",
};

export default function Home() {
  return (
    <>
    <DemoHeader textColor="#ffffff" logoColor="#ffffff" />
      <FractalGlass
        imageSrc={images.blob}
        stripesFrequency={40}
        glassStrength={2.0}
        glassSmoothness={0.014}
        parallaxStrength={0.15}
        distortionMultiplier={8.0}
        edgePadding={0.12}
      />
      <div className="w-fit absolute bottom-8 left-1/2 -translate-x-1/2  text-center max-md:hidden">
        Move the cursor left and right to see the fractal effect
      </div>
      <div className="w-fit absolute text-lg max-sm:text-sm  left-1/2 -translate-x-1/2 bottom-[85%] text-center hidden max-md:block">
        Drag left and right to see the fractal effect
      </div>
    </>
  );
}

export async function generateMetadata() {
  return getDemoPageMetadata("fractal-glass");
}
