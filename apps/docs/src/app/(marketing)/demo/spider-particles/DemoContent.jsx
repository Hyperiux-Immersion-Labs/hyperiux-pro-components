"use client";

import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import RemixerLauncher from "@/components/remixer-panel/RemixerLauncher";
import { useRemixerControls } from "@/components/remixer-panel/useRemixerControls";
import { buildRemixerDemoCode } from "@/components/remixer-panel/build-remixer-code";
import SpiderParticles from "@/components/spider-particles";

export default function DemoContent({ registry }) {
  const remixerProps = registry?.props ?? [];
  const remixerConfig = registry?.remixer ?? {};
  const {
    groups,
    values: controls,
    updateValue,
    resetValues,
  } = useRemixerControls({
    props: remixerProps,
  });

  return (
    <div className="relative min-h-screen bg-black">
      <DemoHeader logoColor="#ffffff" textColor="#ffffff" />

      <SpiderParticles {...controls} />

      <RemixerLauncher
        groups={groups}
        values={controls}
        onChange={updateValue}
        onCopyCode={() =>
          buildRemixerDemoCode({
            registry,
            values: controls,
            groups,
            propsVariableName: "spiderParticlesProps",
          })
        }
        onReset={resetValues}
        defaultOpenGroupId={remixerConfig.defaultOpenGroupId}
        buttonClassName={remixerConfig.layout?.buttonClassName}
        panelClassName={remixerConfig.layout?.panelClassName}
      />
    </div>
  );
}
