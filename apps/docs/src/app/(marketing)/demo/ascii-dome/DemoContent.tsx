"use client";

import AsciiDome from "@/components/ascii-dome";
import DemoHeader from "@/components/preview-chrome/DemoHeader";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";

export default function DemoContent({ registry }: any) {
  return (
    <RegistryRemixerDemo registry={registry} component={AsciiDome}>
      {({ effect }) => (
        <>
          <DemoHeader
            reducedMotionNote={{
              title: "The dome holds still.",
              body: "With reduced motion, ASCII Dome draws one still frame: the dome stops drifting, the characters stop flickering, the grain stops moving and the pointer no longer stirs the light. Setting changes still apply.",
            }}
          />
          <main className="h-screen w-full">{effect}</main>
        </>
      )}
    </RegistryRemixerDemo>
  );
}
