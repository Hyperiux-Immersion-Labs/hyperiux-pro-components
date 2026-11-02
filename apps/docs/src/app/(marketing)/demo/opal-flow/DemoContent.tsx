"use client";

import OpalFlow from "@/components/opal-flow";
import DemoHeader from "@/components/preview-chrome/DemoHeader";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";

export default function DemoContent({ registry }: any) {
  return (
    <RegistryRemixerDemo registry={registry} component={OpalFlow}>
      {({ effect }) => (
        <>
          <DemoHeader
            reducedMotionNote={{
              title: "The paint holds still.",
              body: "With reduced motion, Opal Flow draws one still frame: the paint stops flowing, the grain stops moving and the pointer no longer stirs it. Colour changes still apply.",
            }}
          />
          <main className="h-screen w-full">{effect}</main>
        </>
      )}
    </RegistryRemixerDemo>
  );
}
