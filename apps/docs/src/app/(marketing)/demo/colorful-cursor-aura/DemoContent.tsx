"use client";

import ColorfulCursorAura from "@/components/colorful-cursor-aura";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";

export default function DemoContent({ registry }: { registry: any }) {
  return (
    <RegistryRemixerDemo
      registry={registry}
      component={ColorfulCursorAura}
      copyCodeOptions={{ propsVariableName: "colorfulCursorAuraProps" }}
    >
      {({ effect }) => (
        <>
          <DemoHeader logoColor="#111111" textColor="#111111" />
          {effect}
        </>
      )}
    </RegistryRemixerDemo>
  );
}
