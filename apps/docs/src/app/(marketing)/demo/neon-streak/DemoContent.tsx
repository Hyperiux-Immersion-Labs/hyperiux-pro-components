"use client";

import NeonStreak from "@/components/neon-streak";
import DemoHeader from "@/components/preview-chrome/DemoHeader";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";

export default function DemoContent({ registry }: any) {
  return (
    <RegistryRemixerDemo registry={registry} component={NeonStreak}>
      {({ effect }) => (
        <>
          <DemoHeader
            reducedMotionNote={{
              title: "The ring holds still.",
              body: "With reduced motion, Neon Streak draws one still frame of the finished ring: the smoke stops drifting, the strands stop twisting and the pointer no longer draws. Colour and shape changes still apply.",
            }}
          />
          <main className="h-screen w-full">{effect}</main>
        </>
      )}
    </RegistryRemixerDemo>
  );
}
