import InteractiveArrows from "@/components/interactive-arrows";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import { getDemoPageMetadata } from "@/lib/demo-metadata";



const Page = () => {
  return (
    <>
      <DemoHeader />
      <div className="max-md:hidden">
        <InteractiveArrows/>
        <div className="absolute bottom-[0.5vw] left-1/2 -translate-x-1/2 z-40 bg-white/8 backdrop-blur-sm px-7 py-2 rounded-full text-[#545454] text-[1.1vw] max-md:hidden shadow-lg">
         Drift your cursor inside the canvas - the arrows will skitter, point and follow across every version.
        </div>
      </div>

      {/* Mobile */}
     <div className="hidden max-md:flex h-screen py-10 relative flex-col items-start justify-between bg-[#f4f4f1] px-8">

  {/* Top */}
  <div className="w-full">
    <p className="font-mono hidden text-lg max-sm:text-sm uppercase tracking-[0.35em] text-black/80">
      Desktop Experience
    </p>

    <div className="mt-4 h-px w-full bg-black/30" />
  </div>

    <div className="mb-5 flex h-12 w-12 absolute max-md:hidden max-sm:flex max-sm:bottom-7 bottom-15 right-28 items-center justify-center rounded-full text-black border border-black/50  text-2xl">
        ↗
      </div>

  {/* Bottom */}
  <div className="w-full">
    <div className="text-left">
      
    
      <h1 className="font-mono max-sm:text-[12vw] max-md:text-[8vw] leading-[0.95] font-black uppercase text-black">
        Interactive
        <br />
        Arrows
        
        
      </h1>

      <p className="mt-6 absolute left-1/2 top-90 -translate-x-1/2  rounded-lg bg-black/10 px-5 py-3 text-center text-lg max-sm:text-base leading-[1.3] text-black backdrop-blur-sm">
        Open on desktop to experience this effect
      </p>
    </div>
  </div>

</div>
    </>
  );
};

export default Page;
export async function generateMetadata() {
  return getDemoPageMetadata("interactive-arrows");
}
