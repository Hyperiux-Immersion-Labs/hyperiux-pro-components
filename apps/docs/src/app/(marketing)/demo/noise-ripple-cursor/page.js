import NoiseRippleCursor from "@/components/noise-ripple-cursor";
import LenisSmoothScroll from "@/components/SmoothScroll/LenisScroll";
import HeadAnim from "@/components/Animations/HeadAnim";
import SplitLine from "@/components/WebsiteComps/SplitLine";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import { getDemoPageMetadata } from "@/lib/demo-metadata";


export default function page() {
  return (
    <>
      <LenisSmoothScroll />
      <DemoHeader logoColor="#ffffff" textColor="#ffffff"/>
      <div className="min-h-screen w-full relative bg-[]">
        <section className="h-screen w-full relative">
          <HeadAnim animateOnScroll={false}>
            <h1 className="text-[10vw] w-[80vw] font-medium tracking-tight leading-[.9]! p-[2vw] absolute text-white max-md:text-[14vw] max-md:w-[90vw] bottom-[1.5vw] max-md:bottom-[10vw] max-sm:bottom-[30vw] max-sm:left-3 pointer-events-none z-10">
              Noise Ripple Effect
            </h1>
          </HeadAnim>

          <SplitLine
            as="p"
            start="top 120%"
            className="hidden max-md:block text-[3.5vw] max-sm:text-[4.5vw] absolute max-sm:bottom-[17vw] max-md:bottom-[3.5vh] max-sm:left-5 max-md:left-5  z-10 text-white w-[70%] leading-[1.2]"
          >
            Best enjoyed on desktop for the full effect
          </SplitLine>

          <NoiseRippleCursor imageSrc="https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/h-15.jpg" />

          <SplitLine
            as="p"
            start="top 120%"
            className="absolute bottom-10 max-sm:top-20 right-10 text-[1.2vw] leading-[1.2] z-20 p-3 bg-white/10 rounded-xl max-md:hidden backdrop-blur-lg w-60 text-center"
          >
            Drift through the frame. Leave the ordinary behind.
          </SplitLine>

          <div
            aria-live="polite"
            className="pointer-events-none fixed top-24 right-4 z-40 w-fit max-w-65 rounded-md border border-white/15 bg-white/5 p-3 text-center backdrop-blur-sm max-md:hidden"
          >
            <h2 className="text-sm leading-none text-white">
              The ripple keeps rolling.
            </h2>
            <p className="mt-2 text-xs leading-5 text-white/65">
              Noise Ripple Cursor distorts the image live as your cursor
              moves through it. The distortion is the effect itself, so
              reduced motion can&apos;t be applied here.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}

export async function generateMetadata() {
  return getDemoPageMetadata("noise-ripple-cursor");
}
