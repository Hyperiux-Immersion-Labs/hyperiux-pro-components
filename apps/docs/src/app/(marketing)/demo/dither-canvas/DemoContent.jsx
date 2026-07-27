"use client";

import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import DitherCanvas from "@/components/dither-canvas";
import { buildRemixerDemoCode } from "@/components/remixer-panel/build-remixer-code";
import RemixerLauncher from "@/components/remixer-panel/RemixerLauncher";
import { useRemixerControls } from "@/components/remixer-panel/useRemixerControls";

export default function DemoContent({ registry }) {
  const remixerConfig = registry?.remixer ?? {};
  const {
    groups,
    values: controls,
    updateValue,
    resetValues,
  } = useRemixerControls({
    props: registry?.props ?? [],
  });

  return (
    <main className="relative min-h-screen w-screen overflow-hidden bg-black">
      <DemoHeader logoColor="#FFFFFF" textColor="#ffffff" />
      <DitherCanvas {...controls} />

      <RemixerLauncher
        groups={groups}
        values={controls}
        onChange={updateValue}
        onCopyCode={() =>
          buildRemixerDemoCode({
            registry,
            values: controls,
            groups,
            propsVariableName: "ditherCanvasProps",
          })
        }
        onReset={resetValues}
        defaultOpenGroupId={remixerConfig.defaultOpenGroupId}
        buttonClassName={remixerConfig.layout?.buttonClassName}
        panelClassName={remixerConfig.layout?.panelClassName}
      />
    </main>
  );
}
