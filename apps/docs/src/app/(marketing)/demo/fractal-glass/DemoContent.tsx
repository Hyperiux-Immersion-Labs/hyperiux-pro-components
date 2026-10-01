"use client";

import FractalGlass from "@/components/fractal-glass";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import ReducedMotionNotice from "@/components/WebsiteComps/ReducedMotionNotice";

export default function DemoContent({ registry }: { registry: any }) {
  return (
    <RegistryRemixerDemo
      registry={registry}
      component={FractalGlass}
      copyCodeOptions={{ propsVariableName: "fractalGlassProps" }}
    >
      {({ effect }) => (
        <main className="relative min-h-screen w-screen overflow-hidden bg-black text-white">
          <DemoHeader textColor="#ffffff" logoColor="#FFFFFF" />
          {effect}
          <ReducedMotionNotice>
            <div
              aria-live="polite"
              className="pointer-events-none fixed bottom-4 right-4 z-40 w-fit max-w-65 rounded-md border border-white/15 bg-white/5 p-3 text-center backdrop-blur-sm max-md:hidden"
            >
              <h2 className="text-sm leading-none text-white">
                The glass keeps shifting.
              </h2>
              <p className="mt-2 text-xs leading-5 text-white/65">
                Fractal Glass distorts the image based on cursor and touch
                position in real time. Since the distortion is driven entirely
                by motion, reduced motion can&apos;t be applied here.
              </p>
            </div>
          </ReducedMotionNotice>
          <div className="absolute bottom-8 left-1/2 w-fit -translate-x-1/2 text-center max-md:hidden">
            Move the cursor left and right to see the fractal effect
          </div>
          <div className="absolute bottom-[85%] left-1/2 hidden w-fit -translate-x-1/2 text-center text-lg max-md:block max-sm:text-sm">
            Drag left and right to see the fractal effect
          </div>
        </main>
      )}
    </RegistryRemixerDemo>
  );
}
