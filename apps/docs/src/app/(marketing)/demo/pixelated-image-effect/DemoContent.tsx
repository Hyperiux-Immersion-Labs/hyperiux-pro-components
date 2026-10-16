"use client";

import PixelatedImageEffect from "@/components/pixelated-image-effect";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";
import ReducedMotionNotice from "@/components/WebsiteComps/ReducedMotionNotice";

export default function DemoContent({ registry }: { registry: any }) {
  return (
    <RegistryRemixerDemo
      registry={registry}
      component={PixelatedImageEffect}
      copyCodeOptions={{ propsVariableName: "pixelatedImageEffectProps" }}
    >
      {({ effect }) => (
        <>
          <DemoHeader logoColor="#FFFFFF" textColor="#ffffff" />
          {effect}
          <ReducedMotionNotice>
            <div
              aria-live="polite"
              className="pointer-events-none fixed bottom-4 right-4 z-40 w-fit max-w-65 rounded-md border border-white/15 bg-white/5 p-3 text-center  backdrop-blur-sm max-[1025px]:hidden"
            >
              <h2 className="text-sm leading-none text-white">
                The pixels keep shifting.
              </h2>
              <p className="mt-2 text-xs leading-5 text-white/65">
                Pixelated Image Effect changes pixelation based on cursor
                position in real time. Since the transition is driven entirely by
                motion, reduced motion can&apos;t be applied here.
              </p>
            </div>
          </ReducedMotionNotice>
        </>
      )}
    </RegistryRemixerDemo>
  );
}
