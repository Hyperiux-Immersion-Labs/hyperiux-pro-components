"use client";

import MousePixelation from "@/components/mouse-pixelation";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import ReducedMotionNotice from "@/components/WebsiteComps/ReducedMotionNotice";

export default function DemoContent({ registry }: { registry: any }) {
  return (
    <RegistryRemixerDemo
      registry={registry}
      component={MousePixelation}
      copyCodeOptions={{ propsVariableName: "mousePixelationProps" }}
    >
      {({ effect }) => (
        <main className="relative min-h-screen w-screen overflow-hidden bg-black">
          <DemoHeader logoColor="#FFFFFF" textColor="white" />
          {effect}
          <ReducedMotionNotice>
             <div
              aria-live="polite"
              className="pointer-events-none fixed bottom-28 right-12 z-40 w-fit max-w-65 rounded-md border border-white/15 bg-white/5 p-3 text-center backdrop-blur-sm max-[1025px]:hidden"
            >
              <h2 className="text-sm leading-none text-white">
                The pixels keep shifting.
              </h2>
              <p className="mt-2 text-xs leading-5 text-white/65">
                Mouse Pixelation reacts to cursor position across all three
                variants, in real time. Since the transition is driven entirely
                by motion, reduced motion can&apos;t be applied here.
              </p>
            </div>
          </ReducedMotionNotice>
        </main>
      )}
    </RegistryRemixerDemo>
  );
}
