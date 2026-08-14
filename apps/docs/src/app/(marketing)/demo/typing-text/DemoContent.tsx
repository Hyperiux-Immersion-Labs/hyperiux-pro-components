"use client";

import TypingText from "@/components/typing-text";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";

export default function DemoContent({ registry }: { registry: any }) {
  return (
    <RegistryRemixerDemo
      registry={registry}
      component={TypingText}
      copyCodeOptions={{ propsVariableName: "typingTextProps" }}
    >
      {({ effect }) => (
        <main className="relative min-h-screen overflow-hidden bg-[#121212] text-white">
          <DemoHeader logoColor="#FFFFFF" textColor="#ffffff" />
          {effect}
        </main>
      )}
    </RegistryRemixerDemo>
  );
}
