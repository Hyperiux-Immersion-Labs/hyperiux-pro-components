"use client";

import type { ReactNode } from "react";
import SweepLift from "@/components/sweep-lift";
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
        <SweepLift {...values}>
          <DemoHeader logoColor="#FFFFFF" textColor="#ffffff" />
          {children}
        </SweepLift>
      )}
      copyCodeOptions={{
        includeDemoHeader: false,
        propsVariableName: "sweepLiftProps",
      }}
    />
  );
}
