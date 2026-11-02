"use client";

import MossGrid from "@/components/moss-grid";
import DemoHeader from "@/components/preview-chrome/DemoHeader";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";

export default function DemoContent({ registry }: any) {
  return (
    <RegistryRemixerDemo registry={registry} component={MossGrid}>
      {({ effect }) => (
        <>
          <DemoHeader
            reducedMotionNote={{
              title: "The hills hold still.",
              body: "With reduced motion, Moss Grid shows one still frame: the hills stop drifting, the lights stop shimmering, and the whole grid shows, since there is no pointer reveal. Setting changes still apply.",
            }}
          />
          <main className="h-screen w-full">{effect}</main>
        </>
      )}
    </RegistryRemixerDemo>
  );
}
