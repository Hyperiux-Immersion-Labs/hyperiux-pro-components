import InteractiveArrows from "@/components/interactive-arrows";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import { getDemoPageMetadata } from "@/lib/demo-metadata";

const Page = () => {
  return (
    <>
      <DemoHeader />
      <div className="max-[1025px]:hidden">
        <InteractiveArrows/>
        <div className="absolute bottom-[0.5vw] text-center backdrop-blur-sm bg-black/10 left-1/2 -translate-x-1/2 z-40  px-7 py-2 rounded-full text-[#545454] w-[40vw] text-[1.1vw] max-[1025px]:hidden">
         Drift your cursor inside the canvas - the arrows will skitter, point and follow across every version.
        </div>
      </div>

      {/* Mobile */}
     <div className="hidden max-[1025px]:flex h-screen py-10 pb-20 relative flex-col items-start justify-between bg-[#f4f4f1] px-8">

  {/* Top */}
  <div className="w-full">
    <p className="font-mono hidden text-lg max-md:text-sm uppercase tracking-[0.35em] text-black/80">
      Desktop Experience
    </p>

    <div className="mt-4 h-px w-full bg-black/30" />
  </div>

 

  {/* Bottom */}
  <div className="w-full">
    <div className="text-left">
      <h1 className="font-mono max-md:text-[12vw] max-[1025px]:text-[8vw] leading-[0.95] font-black uppercase text-black">
        Interactive
        <br />
        Arrows  
      </h1>

      <p className="mt-6 absolute left-1/2 top-90 -translate-x-1/2  rounded-lg bg-black/10 px-5 py-3 text-center text-lg max-md:text-base leading-[1.3] text-black backdrop-blur-sm">
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
