"use client";

import type { ReactNode } from "react";
import DepthShiftTransition from "@/components/depth-shift-transition";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";
import type { RegistryLike } from "@/components/remixer-panel/types";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";

export default function DemoContent({
  children,
  registry,
}: {
  children: ReactNode;
  registry: RegistryLike;
}) {
  return (
    <RegistryRemixerDemo
      registry={registry}
      render={(values) => (
        <DepthShiftTransition {...values}>
          <DemoHeader />
          {children}
        </DepthShiftTransition>
      )}
      copyCodeOptions={{
        includeDemoHeader: false,
        propsVariableName: "depthShiftTransitionProps",
      }}
    />
  );
}
