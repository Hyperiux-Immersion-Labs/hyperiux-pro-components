"use client";

import CharacterTrail from "@/components/character-trail";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import ReducedMotionNotice from "@/components/WebsiteComps/ReducedMotionNotice";

export default function DemoContent({ registry }: { registry: any }) {
  return (
    <RegistryRemixerDemo
      registry={registry}
      component={CharacterTrail}
      copyCodeOptions={{ propsVariableName: "characterTrailProps" }}
    >
      {({ effect }) => (
        <>
          <DemoHeader  />
          {effect}
          <ReducedMotionNotice>
            <div
              aria-live="polite"
              className="pointer-events-none fixed top-25 right-8 z-50000 w-fit max-w-65 rounded-md border bg-white/10 border-black/10 backdrop-blur-sm  p-3 text-center max-[1025px]:hidden"
            >
              <h2 className="text-sm leading-none text-[#111111]">
                The characters keep trailing.
              </h2>
              <p className="mt-2 text-xs leading-5 text-black/65">
                Character Trail redraws letters along your cursor&apos;s path in real
                time. The animation can&apos;t be reduced without removing the effect.
              </p>
            </div>
          </ReducedMotionNotice>
        </>
      )}
    </RegistryRemixerDemo>
  );
}
