"use client";

import RibbonDrift from "@/components/ribbon-drift";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import ScrollBottom from "@/components/WebsiteComps/ScrollBottom";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";
import ReducedMotionNotice from "@/components/WebsiteComps/ReducedMotionNotice";

export default function DemoContent({ registry }: { registry: any }) {
  return (
    <RegistryRemixerDemo
      registry={registry}
      component={RibbonDrift}
      copyCodeOptions={{ propsVariableName: "ribbonDriftProps" }}
    >
      {({ effect }) => (
        <>
          <DemoHeader />
          {effect}
          <ReducedMotionNotice>
            <div
            aria-live="polite"
            className="pointer-events-none fixed bottom-4 right-4 z-40 w-fit max-w-65 rounded-md border border-black/10 bg-white/10 backdrop-blur-md p-3 text-center"
            >
            <h2 className="text-sm leading-none text-[#111111]">
            The ribbon keeps drifting.
            </h2>
            <p className="mt-2 text-xs leading-5 text-black/65">
            Ribbon Drift ties its image reveal and text splits to scroll
            position. Since the animation is driven by scroll motion itself,
            it can&apos;t be reduced without removing the effect.
            </p>
            </div>
          </ReducedMotionNotice>
          <ScrollBottom textColor='text-[#111111]' />
        </>
      )}
    </RegistryRemixerDemo>
  );
}
