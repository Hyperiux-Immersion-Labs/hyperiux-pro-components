"use client";

import DottedTrail from "@/components/dotter-trail";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";

export default function DemoContent({ registry }: { registry: any }) {
  return (
    <RegistryRemixerDemo
      registry={registry}
      component={DottedTrail}
      copyCodeOptions={{ propsVariableName: "dottedTrailProps" }}
    />
  );
}
