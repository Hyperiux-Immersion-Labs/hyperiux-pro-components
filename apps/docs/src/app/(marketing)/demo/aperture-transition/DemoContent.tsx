"use client";

import type { ReactNode } from "react";
import ApertureTransition from "@/components/aperture-transition";
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
        <ApertureTransition {...values}>
          <DemoHeader logoColor="#FFFFFF" textColor="#ffffff" />
          {children}
        </ApertureTransition>
      )}
      copyCodeOptions={{
        includeDemoHeader: false,
        propsVariableName: "apertureTransitionProps",
      }}
    />
  );
}
