"use client";

import HeadAnim from "@/components/Animations/HeadAnim";
import FullScreenCrosshair from "@/components/full-screen-crosshair";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";
import SplitLine from "@/components/WebsiteComps/SplitLine";
import ReducedMotionNotice from "@/components/WebsiteComps/ReducedMotionNotice";

export default function DemoContent({ registry }: { registry: any }) {
  return (
    <RegistryRemixerDemo
      registry={registry}
      component={FullScreenCrosshair}
      copyCodeOptions={{ propsVariableName: "fullScreenCrosshairProps" }}
    >
      {({ effect }) => (
        <main className="h-screen w-screen relative bg-[#211951] text-[#826fffaa]">
          <DemoHeader logoColor="#FFFFFF" textColor="#ffffff" />
          {effect}
          <ReducedMotionNotice>
            <div
              aria-live="polite"
              className="pointer-events-none fixed bottom-4 right-4 z-99999 w-fit max-w-65 rounded-md border border-white/15 bg-white/10 p-3 text-center backdrop-blur-sm max-[1025px]:hidden"
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
          </ReducedMotionNotice>
          <HeadAnim>
            <h1 className="w-full h-full flex items-center justify-center text-center text-[3.5vw] font-medium max-md:text-[6.5vw]">
              Full Screen Crosshair
            </h1>
          </HeadAnim>
          <SplitLine
            as="p"
            start="top 120%"
            className="absolute max-md:hidden bottom-8 left-1/2 backdrop-blur-sm -translate-x-1/2 py-3 px-5 bg-white/5 text-center text-neutral-200 text-base rounded-xl"
          >
            Move your cursor to see the crosshair come alive ✛
          </SplitLine>
          <p className="absolute max-md:block hidden bottom-20 left-1/2 backdrop-blur-sm -translate-x-1/2 w-[50vw] max-sm:w-[80vw] py-3 px-5 bg-white/5 text-center text-neutral-200 text-lg rounded-2xl">
            Tap to see the crosshair move ✛
            <br />
            Best experienced on desktop.
          </p>
        </main>
      )}
    </RegistryRemixerDemo>
  );
}
