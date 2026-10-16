"use client";

import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";
import CollidingModels from "@/components/colliding-models";
import ReducedMotionNotice from "@/components/WebsiteComps/ReducedMotionNotice";

export default function DemoContent({ registry }: { registry: any }) {
  return (
    <RegistryRemixerDemo
      registry={registry}
      component={CollidingModels}
      copyCodeOptions={{ propsVariableName: "collidingModelsProps" }}
    >
      {({ effect }) => (
        <>
          <DemoHeader textColor="#ffffff" />

          {effect}
          <ReducedMotionNotice>
            <div
              aria-live="polite"
              className="pointer-events-none fixed bottom-4 right-4 z-40 w-fit max-w-65 rounded-md border border-black/10 bg-[#0e0e0e]  p-3 text-center"
            >
              <h2 className="text-sm leading-none text-white">
                The models keep colliding.
              </h2>
              <p className="mt-2 text-xs leading-5 text-white/90">
                Colliding Models runs a live physics simulation that reacts to
                cursor movement continuously. Since the motion is the entire
                effect, reduced motion can&apos;t be applied here.
              </p>
            </div>
          </ReducedMotionNotice>
        </>
      )}
    </RegistryRemixerDemo>
  );
}
