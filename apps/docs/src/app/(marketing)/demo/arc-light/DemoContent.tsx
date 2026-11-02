"use client";

import ArcLight from "@/components/arc-light";
import DemoHeader from "@/components/preview-chrome/DemoHeader";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";

export default function DemoContent({ registry }: any) {
  return (
    <RegistryRemixerDemo registry={registry} component={ArcLight}>
      {({ effect }) => (
        <>
          <DemoHeader
            reducedMotionNote={{
              title: "The arcs hold still.",
              body: "With reduced motion, Arc Light draws one still frame: it stops drifting, the grain stops moving and the pointer no longer stirs the light. Colour changes still apply.",
            }}
          />
          <main className="h-screen w-full">{effect}</main>
        </>
      )}
    </RegistryRemixerDemo>
  );
}
