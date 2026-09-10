"use client";

import GsapFlipCard from "@/components/gsap-flip-card";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";
import type { RegistryLike } from "@/components/remixer-panel/types";

export default function DemoContent({ registry }: { registry: RegistryLike }) {
  return (
    <RegistryRemixerDemo
      registry={registry}
      component={GsapFlipCard}
      copyCodeOptions={{ propsVariableName: "gsapFlipCardProps" }}
    >
      {({ values, effect }) => (
        <main
          className="h-screen "
          style={{ backgroundColor: values.backgroundColor as string }}
        >
          <DemoHeader
            textColor={values.textColor as string}
            logoColor={values.textColor as string}
          />
          {effect}
        </main>
      )}
    </RegistryRemixerDemo>
  );
}
