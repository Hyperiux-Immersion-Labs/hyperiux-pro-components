import ButterflyTrailCursor from "@/components/butterfly-trail-cursor";
import React from "react";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import { getDemoPageMetadata } from "@/lib/demo-metadata";


const page = () => {
  return (
    <>
      <DemoHeader />
      <ButterflyTrailCursor />
      <div className="pointer-events-none absolute left-1/2 top-1/2  -translate-x-1/2 -translate-y-1/2 text-center ">
        <h1 className="font-serif text-4xl text-zinc-600">
          ʚଓ Unseen Butterflies ʚଓ
        </h1>
        <p className="mt-4 font-serif max-md:hidden text-md italic tracking-wide text-zinc-500">
          Stir the air with your cursor - the butterflies will follow.
        </p>
      </div>
      <div className="absolute max-md:block hidden max-sm:bottom-12 max-md:bottom-16 left-1/2 -translate-x-1/2 text-center">
        <p className="font-serif text-zinc-600 text-[3.5vw] max-sm:text-[6vw] leading-none">
          Tap to reveal the effect
        </p>
        <p className="text-zinc-500 leading-none text-[2.5vw] max-sm:text-[3.5vw] max-md:mt-3 max-sm:mt-2">
          For the best experience, open on desktop
        </p>
      </div>
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-40 w-fit max-w-65 rounded-md border border-black/10 bg-[#F8F8F3] p-3 text-center max-md:hidden"
      >
        <h2 className="text-sm leading-none text-[#111111]">
          The butterflies keep drifting.
        </h2>
        <p className="mt-2 text-xs leading-5 text-black/65">
          These butterflies are animated purely by cursor movement. Pausing
          that motion would remove the effect, so reduced motion isn&apos;t
          supported here.
        </p>
      </div>
    </>
  );
};

export default page;

export async function generateMetadata() {
  return getDemoPageMetadata("butterfly-trail-cursor");
}
