"use client";

import AsciiBand from "@/components/ascii-band";
import DemoHeader from "@/components/preview-chrome/DemoHeader";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";

export default function DemoContent({ registry }: any) {
  return (
    <RegistryRemixerDemo registry={registry} component={AsciiBand}>
      {({ effect }) => (
        <>
          <DemoHeader
            reducedMotionNote={{
              title: "The band holds still.",
              body: "With reduced motion, ASCII Band draws one still frame: the band stops drifting, the characters stop flickering, the grain stops moving and the pointer no longer stirs the light. Setting changes still apply.",
            }}
          />
          <main className="h-screen w-full">{effect}</main>
        </>
      )}
    </RegistryRemixerDemo>
  );
}
