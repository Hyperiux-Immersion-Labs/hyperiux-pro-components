"use client";

import StrokeText from "@/components/stroke-text";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";

export default function DemoContent({ registry }: { registry: any }) {
  return (
    <RegistryRemixerDemo
      registry={registry}
      component={StrokeText}
      copyCodeOptions={{ propsVariableName: "strokeTextProps" }}
    >
      {({ effect }) => (
        <main className="relative min-h-screen overflow-hidden bg-[#17191b] text-white">
          <DemoHeader logoColor="#FFFFFF" textColor="#ffffff" />
          {effect}
        </main>
      )}
    </RegistryRemixerDemo>
  );
}
