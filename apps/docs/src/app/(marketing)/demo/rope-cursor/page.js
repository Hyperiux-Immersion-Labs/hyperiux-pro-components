import RopeCursor from "@/components/rope-cursor";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import React from "react";
import { getDemoPageMetadata } from "@/lib/demo-metadata";

export default function page() {
  return (
    <>
      <DemoHeader />
      <div className="h-screen w-full bg-[#F1EADE] text-[#bda985] overflow-hidden">
        <RopeCursor
          ropeColor="#bda985"
          ropeWidth={2}
          ropeOpacity={0.6}
          segmentLength={0}
          segmentCount={8}
        />
        <div className="flex items-center max-md:hidden justify-center flex-col h-full pointer-events-none">
          <h1 className="text-[bda985] text-[4vw] text-center">Rope Cursor</h1>
          <p className="opacity-90 text-[2.5vw] text-center">
            (Move your cursor around to see the rope)
          </p>
        </div>
        <div className="items-center  max-md:flex hidden justify-center gap-5 flex-col h-full pointer-events-none">
          <p className="text-[bda985] text-4xl max-sm:text-2xl text-center">
            Rope Cursor
          </p>
          <p className="opacity-90 text-lg leading-[1.2]  text-center">
            Desktop only - that’s where the effect comes alive
          </p>
        </div>
        <div
          aria-live="polite"
          className="pointer-events-none fixed bottom-4 right-4 z-40 w-fit max-w-65 rounded-md border border-black/10 bg-[#F8F8F3] p-3 text-center max-md:hidden"
        >
          <h2 className="text-sm leading-none text-[#111111]">
            The rope keeps swinging.
          </h2>
          <p className="mt-2 text-xs leading-5 text-black/65">
            Rope Cursor is a live trail of your cursor&apos;s movement. The
            motion is the entire effect, so it can&apos;t be swapped for a
            reduced motion alternative.
          </p>
        </div>
      </div>
    </>
  );
}

export async function generateMetadata() {
  return getDemoPageMetadata("rope-cursor");
}
