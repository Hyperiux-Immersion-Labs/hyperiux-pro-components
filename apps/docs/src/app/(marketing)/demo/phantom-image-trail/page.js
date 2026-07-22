import PhantomImageTrail from "@/components/phantom-image-trail";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import React from "react";
import { getDemoPageMetadata } from "@/lib/demo-metadata";


const images = [

  { src: "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-11.jpg", alt: "Gradient 1" },
  { src: "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-12.jpg", alt: "Gradient 2" },
  { src: "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-13.jpg", alt: "Gradient 3" },
  { src: "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-14.jpg", alt: "Gradient 4" },
  { src: "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-15.jpg", alt: "Gradient 5" },
  { src: "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-01.jpg", alt: "Gradient 6" },
  { src: "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-02.jpg", alt: "Gradient 7" },
];

const page = () => {
    return (
        <>
        <DemoHeader/>
        <div className="w-screen h-screen relative  bg-[#f8fdfe]">
            <div className="absolute w-full h-full flex justify-center items-center">
                <h1 className="text-[5.5vw] max-md:hidden text-stone-800">
                    Move the Mouse to See Magic
                </h1> 
                <p className="max-sm:text-[5.5vw] max-md:text-[4vw] font-serif text-center leading-[1.4] hidden max-md:block text-stone-800">
                    Tap to explore 
                    <span className="max-sm:uppercase block text-center max-sm:pt-[5vw] max-md:pt-[3vw] leading-[1.2]">
                     The full magic happens on Desktop
                    </span>
                </p>
            </div>
            <PhantomImageTrail
                images={images}
                enableRotation={true}
                idleSpawn={false}
                idleDelay={300}
                cursorOffsetX={-12}
                cursorOffsetY={-12}
                popOutDuration={0.8}
                fadeOutDuration={0.5}
                idlePopOutMultiplier={2.2}
                idleFadeMultiplier={1.8}
                imageMultiplier={3}
            />
            <div
                aria-live="polite"
                className="pointer-events-none fixed bottom-4 right-4 z-40 w-fit max-w-65 rounded-md border border-black/10 bg-[#F8F8F3] p-3 text-center max-md:hidden"
            >
                <h2 className="text-sm leading-none text-[#111111]">
                    The trail keeps spawning.
                </h2>
                <p className="mt-2 text-xs leading-5 text-black/65">
                    Phantom Image Trail spawns images as the cursor moves. The
                    motion is the effect itself, so there&apos;s no static
                    fallback for reduced motion preferences.
                </p>
            </div>
        </div>
        </>
    );
};

export default page;

export async function generateMetadata() {
  return getDemoPageMetadata("phantom-image-trail");
}
