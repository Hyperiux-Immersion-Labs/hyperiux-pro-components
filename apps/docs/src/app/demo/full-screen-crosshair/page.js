import HeadAnim from "@/components/Animations/HeadAnim";
import FullScreenCrosshair from "@/components/full-screen-crosshair";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import SplitLine from "@/components/WebsiteComps/SplitLine";

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

 <p className="absolute max-md:block hidden bottom-10 left-1/2 backdrop-blur-sm -translate-x-1/2 w-[50vw] max-sm:w-[80vw] py-3 px-5 bg-white/5 text-center text-neutral-200 text-lg rounded-2xl">
  Tap to see the crosshair move ✛
  <br/>
  Best experienced on desktop.
 </p>
 </main>
 );
}
