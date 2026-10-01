"use client";

import ColorfulCursorAura from "@/components/colorful-cursor-aura";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import ReducedMotionNotice from "@/components/WebsiteComps/ReducedMotionNotice";

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
          <ReducedMotionNotice>
            <div
              aria-live="polite"
              className="pointer-events-none fixed bottom-4 right-4 z-40 w-fit max-w-65 rounded-md border border-black/10 bg-white/10 p-3 text-center  max-[1025px]:hidden"
            >
              <h2 className="text-sm leading-none text-[#111111]">
                The aura keeps glowing.
              </h2>
              <p className="mt-2 text-xs leading-5 text-black/65">
                Colorful Cursor Aura renders continuously shifting color driven by
                cursor movement. The motion is the entire effect, so it
                can&apos;t be reduced.
              </p>
            </div>
          </ReducedMotionNotice>
        </>
      )}
    </RegistryRemixerDemo>
  );
}
