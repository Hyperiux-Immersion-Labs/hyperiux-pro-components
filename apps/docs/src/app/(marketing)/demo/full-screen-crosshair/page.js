import HeadAnim from "@/components/Animations/HeadAnim";
import FullScreenCrosshair from "@/components/full-screen-crosshair";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import SplitLine from "@/components/WebsiteComps/SplitLine";
import { getDemoPageMetadata } from "@/lib/demo-metadata";


export default function Page() {
  return (
    <main className="h-screen w-screen relative bg-[#211951] text-[#826fffaa]">
      <DemoHeader logoColor="#ffffff" textColor="#ffffff" />
      <FullScreenCrosshair
        lineSize={1500}
        thickness={0.5}
        lerpFactor={0.1}
        hideNativeCursor
        color="#F0F3FF"
        centerContent="•"
      />

      <HeadAnim>


 <h1 className="w-full h-full flex items-center justify-center text-center text-[3.5vw] font-medium max-md:text-[6.5vw]">
 Full Screen Crosshair
 </h1>
      </HeadAnim>

      <SplitLine
                   as="p"
                   start="top 120%"
 className="absolute max-md:hidden bottom-8 left-1/2 backdrop-blur-sm  -translate-x-1/2 py-3 px-5 bg-white/5 text-center text-neutral-200 text-base rounded-xl">
       Move your cursor to see the crosshair come alive ✛
 </SplitLine>

 <p className="absolute max-md:block hidden bottom-20 left-1/2 backdrop-blur-sm -translate-x-1/2 w-[50vw] max-sm:w-[80vw] py-3 px-5 bg-white/5 text-center text-neutral-200 text-lg rounded-2xl">
  Tap to see the crosshair move ✛
  <br/>
  Best experienced on desktop.
 </p>

 <div
   aria-live="polite"
   className="pointer-events-none fixed bottom-4 right-4 z-99999 w-fit max-w-65 rounded-md border border-white/15 bg-white/10 p-3 text-center backdrop-blur-sm max-md:hidden"
 >
   <h2 className="text-sm leading-none text-white">
     The crosshair keeps tracking.
   </h2>
   <p className="mt-2 text-xs leading-5 text-white/65">
     Full Screen Crosshair follows your cursor continuously across the
     screen. Since tracking motion is the entire effect, reduced motion
     can&apos;t be applied here.
   </p>
 </div>
 </main>
 );
}

export async function generateMetadata() {
  return getDemoPageMetadata("full-screen-crosshair");
}
