"use client";

import NumberCounter from "@/components/number-counter";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import ReducedMotionNotice from "@/components/WebsiteComps/ReducedMotionNotice";

export default function DemoContent({ registry }: { registry: any }) {
  return (
    <RegistryRemixerDemo
      registry={registry}
      component={NumberCounter}
      copyCodeOptions={{ propsVariableName: "numberCounterProps" }}
    >
      {({ effect }) => (
        <>
          <DemoHeader logoColor="#111111" textColor="#111111" />
          {effect}
          <ReducedMotionNotice>
            <div
              aria-live="polite"
              className="pointer-events-none fixed bottom-6 right-6 z-60 w-fit max-w-[min(90vw,26rem)] rounded-md border border-black/10 bg-[#F8F8F3] p-6 text-center shadow-sm"
            >
              <h2 className="text-[1.15vw] max-[1025px]:text-[2vw] max-md:text-[3.5vw] leading-none text-[#111111]">
                The digits are holding still.
              </h2>
              <p className="mx-auto mt-4 text-sm leading-6 text-black/65">
                Reduced motion is enabled, so the counters fade in as static numbers
                instead of rolling vertically. The rolling effect depends on repeated
                upward motion, and your system preference asks us to keep that still.
              </p>
            </div>
          </ReducedMotionNotice>
        </>
      )}
    </RegistryRemixerDemo>
  );
}
