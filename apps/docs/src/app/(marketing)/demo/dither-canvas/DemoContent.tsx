"use client";

import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import DitherCanvas from "@/components/dither-canvas";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";
import ReducedMotionNotice from "@/components/WebsiteComps/ReducedMotionNotice";

export default function DemoContent({ registry }: { registry: any }) {
  return (
    <RegistryRemixerDemo
      registry={registry}
      component={DitherCanvas}
      copyCodeOptions={{ propsVariableName: "ditherCanvasProps" }}
    >
      {({ effect }) => (
        <main className="relative min-h-screen w-screen overflow-hidden bg-black">
          <DemoHeader logoColor="#FFFFFF" textColor="#ffffff" />
          {effect}
          <ReducedMotionNotice>
            <div
              aria-live="polite"
              className="fixed bottom-6 right-6 z-60 w-fit max-w-[min(90vw,26rem)] rounded-md border border-black/10 bg-[#F8F8F3] p-6 text-center shadow-sm"
            >
              <h2 className="text-[1.15vw] max-md:text-[3.5vw] max-[1025px]:text-[2vw] leading-none text-[#111111]">
                This effect can&apos;t be reduced.
              </h2>
              <p className="mx-auto mt-4 text-sm leading-6 text-black/65">
                Reduced motion is enabled, but this effect is a continuous
                cursor-driven fluid distortion rendered every frame, and
                can&apos;t be simplified to a fade without losing the effect
                entirely.
              </p>
            </div>
          </ReducedMotionNotice>
        </main>
      )}
    </RegistryRemixerDemo>
  );
}
