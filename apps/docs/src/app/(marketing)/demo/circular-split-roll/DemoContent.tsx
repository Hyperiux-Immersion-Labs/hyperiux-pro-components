"use client";

import CircularSplitRoll from "@/components/circular-split-roll";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import ScrollBottom from "@/components/WebsiteComps/ScrollBottom";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";
import ReducedMotionNotice from "@/components/WebsiteComps/ReducedMotionNotice";

export default function DemoContent({ registry }: { registry: any }) {
  return (
    <RegistryRemixerDemo
      registry={registry}
      component={CircularSplitRoll}
      copyCodeOptions={{ propsVariableName: "circularSplitRollProps" }}
    >
      {({ effect }) => (
        <>
          <DemoHeader textColor="#ffffff" logoColor="#FFFFFF" />
          <div className="max-md:block flex flex-col justify-center items-center gap-[2vw] text-center max-sm:pt-[18vw] pt-[10vw] sr-only">
            <h1 className="text-[7vw] max-sm:text-[11vw]">
              Circular Split Roll
            </h1>
            <p>Open in desktop for the better experience</p>
          </div>
          {effect}
          <ReducedMotionNotice>
            <div
              aria-live="polite"
              className="pointer-events-none fixed bottom-6 right-6 z-60 w-fit max-w-[min(90vw,26rem)] rounded-md border border-black/10 bg-white p-6 text-center shadow-sm"
            >
              <h2 className="text-[1.15vw] max-[1025px]:text-[2vw] max-md:text-[3.5vw] leading-none text-black">
                This effect can&apos;t be reduced.
              </h2>
              <p className="mx-auto mt-4 text-sm leading-6 text-black">
                Reduced motion is enabled, but this effect relies on continuous
                rotation around a circular path as you scroll, and can&apos;t be
                simplified to a fade without losing the effect entirely.
              </p>
            </div>
          </ReducedMotionNotice>
          <ScrollBottom />
        </>
      )}
    </RegistryRemixerDemo>
  );
}
