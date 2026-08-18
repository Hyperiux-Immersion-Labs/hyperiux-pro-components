"use client";

import { VariableTextProximityDemo } from "@/components/variable-text-proximity";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";

export default function DemoContent({ registry }: { registry: any }) {
  return (
    <RegistryRemixerDemo
      registry={registry}
      render={(values) => <VariableTextProximityDemo {...values} />}
      copyCodeOptions={{ propsVariableName: "variableTextProximityProps" }}
    >
      {({ effect }) => (
        <main className="relative min-h-screen overflow-hidden bg-[#080808] text-white">
          <DemoHeader logoColor="#ffffff" textColor="#ffffff" />
          {effect}
        </main>
      )}
    </RegistryRemixerDemo>
  );
}
