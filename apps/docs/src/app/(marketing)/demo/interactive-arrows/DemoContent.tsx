"use client";

import InteractiveArrows from "@/components/interactive-arrows";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import ReducedMotionNotice from "@/components/WebsiteComps/ReducedMotionNotice";

export default function DemoContent({ registry }: { registry: any }) {
  return (
    <RegistryRemixerDemo
      registry={registry}
      component={InteractiveArrows}
      copyCodeOptions={{ propsVariableName: "interactiveArrowsProps" }}
    >
      {({ effect }) => (
        <>
          <DemoHeader logoColor="#1a1a1a" textColor="#1a1a1a" />
          {effect}
          <ReducedMotionNotice>
            <div
              aria-live="polite"
              className="pointer-events-none fixed bottom-4 right-4 z-40 w-fit max-w-65 rounded-md border border-black/10 bg-[#F8F8F3] p-3 text-center"
            >
              <h2 className="text-sm leading-none text-[#111111]">
                The arrows keep turning.
              </h2>
              <p className="mt-2 text-xs leading-5 text-black/65">
                Each arrow reorients toward your cursor continuously. That
                motion is the entire effect, so it can&apos;t be scaled back for
                reduced motion preferences.
              </p>
            </div>
          </ReducedMotionNotice>
        </>
      )}
    </RegistryRemixerDemo>
  );
}
