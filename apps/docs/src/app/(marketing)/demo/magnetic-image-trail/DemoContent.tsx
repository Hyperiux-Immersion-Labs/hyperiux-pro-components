"use client";

import MagneticImageTrail from "@/components/magnetic-image-trail";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import ReducedMotionNotice from "@/components/WebsiteComps/ReducedMotionNotice";

export default function DemoContent({ registry }: { registry: any }) {
  return (
    <RegistryRemixerDemo
      registry={registry}
      component={MagneticImageTrail}
      copyCodeOptions={{ propsVariableName: "magneticImageTrailProps" }}
    >
      {({ effect }) => (
        <>
          <DemoHeader  />
          {effect}
          <ReducedMotionNotice>
            <div
              aria-live="polite"
              className="pointer-events-none fixed bottom-4 right-4 z-9000 w-fit max-w-65 rounded-md border border-black/10 bg-white/40 p-3 text-center max-[1025px]:hidden"
            >
              <h2 className="text-sm leading-none text-[#111111]">
                The images keep pulling.
              </h2>
              <p className="mt-2 text-xs leading-5 text-black/65">
                Magnetic Image Trail animates images being drawn toward your
                cursor in real time. Pausing that motion would remove the
                effect.
              </p>
            </div>
          </ReducedMotionNotice>
        </>
      )}
    </RegistryRemixerDemo>
  );
}
