"use client";

import DirectionalMenu from "@/components/directional-menu";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";

export default function DemoContent({ registry }: { registry: any }) {
  return (
    <RegistryRemixerDemo
      registry={registry}
      component={DirectionalMenu}
      copyCodeOptions={{ propsVariableName: "directionalMenuProps" }}
    >
      {({ effect }) => <div className="relative min-h-screen">{effect}</div>}
    </RegistryRemixerDemo>
  );
}
