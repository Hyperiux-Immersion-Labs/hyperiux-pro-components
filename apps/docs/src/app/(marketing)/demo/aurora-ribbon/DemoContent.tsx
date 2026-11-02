"use client";

import AuroraRibbon from "@/components/aurora-ribbon";
import DemoHeader from "@/components/preview-chrome/DemoHeader";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";

export default function DemoContent({ registry }: any) {
  return (
    <RegistryRemixerDemo registry={registry} component={AuroraRibbon}>
      {({ effect }) => (
        <>
          <DemoHeader
            reducedMotionNote={{
              title: "The ribbon holds still.",
              body: "With reduced motion, Aurora Ribbon draws one still frame: it stops drifting, the grain stops moving and the pointer no longer stirs the light. Colour changes still apply.",
            }}
          />
          <main className="h-screen w-full">{effect}</main>
        </>
      )}
    </RegistryRemixerDemo>
  );
}
