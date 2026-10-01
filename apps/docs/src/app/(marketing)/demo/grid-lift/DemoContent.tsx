"use client";

import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import GridLift from "@/components/grid-lift";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";
import ReducedMotionNotice from "@/components/WebsiteComps/ReducedMotionNotice";

export default function DemoContent({ registry }: { registry: any }) {
  return (
    <RegistryRemixerDemo
      registry={registry}
      component={GridLift}
      copyCodeOptions={{ propsVariableName: "gridLiftProps" }}
    >
      {({ effect }) => (
        <>
          <DemoHeader logoColor="#ffffff" textColor="#ffffff" />
          {effect}
          <ReducedMotionNotice>
            <div
              aria-live="polite"
              className="pointer-events-none fixed bottom-4 left-4 z-40 w-fit max-w-75 rounded-md border border-white/15 bg-white/5 p-3 text-center backdrop-blur-sm max-md:hidden"
            >
              <h2 className="text-sm leading-none text-white">
                The grid keeps lifting.
              </h2>
              <p className="mt-2 text-xs leading-5 text-white/65">
                Grid Lift raises the mask grid wherever your cursor drifts, in
                real time. Since the motion is the entire effect, reduced motion
                can&apos;t be applied here.
              </p>
            </div>
          </ReducedMotionNotice>
        </>
      )}
    </RegistryRemixerDemo>
  );
}
