"use client";

import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";
import StripSlider from "@/components/strip-slider";
import ReducedMotionNotice from "@/components/WebsiteComps/ReducedMotionNotice";

export default function DemoContent({ registry }: { registry: any }) {
  return (
    <RegistryRemixerDemo
      registry={registry}
      component={StripSlider}
      copyCodeOptions={{ propsVariableName: "stripSliderProps" }}
    >
      {({ effect }) => (
        <>
          <DemoHeader logoColor="#ffffff" textColor="#ffffff" />
          {effect}
          <ReducedMotionNotice>
            <div
            aria-live="polite"
            className="pointer-events-none fixed bottom-4 right-4 z-40 w-fit max-w-65 rounded-md border border-white/15 bg-white/5 p-3 text-center backdrop-blur-sm max-[1025px]:hidden"
            >
            <h2 className="text-sm leading-none text-white">
            The strip keeps sliding.
            </h2>
            <p className="mt-2 text-xs leading-5 text-white/65">
            Strip Slider ties its horizontal motion to scroll position via
            smooth-scroll physics. Since the animation is driven by scroll
            motion itself, it can&apos;t be reduced without removing the
            effect.
            </p>
            </div>
          </ReducedMotionNotice>
        </>
      )}
    </RegistryRemixerDemo>
  );
}
