"use client";

import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";
import LiquidGlassWrapper from "./LiquidGlassWrapper";
import ReducedMotionNotice from "@/components/WebsiteComps/ReducedMotionNotice";

export default function DemoContent({ registry }: { registry: any }) {
  return (
    <RegistryRemixerDemo
      registry={registry}
      render={(values: any) => <LiquidGlassWrapper cursorProps={values} />}
      copyCodeOptions={{ propsVariableName: "liquidGlassCursorProps" }}
    >
      {({ effect }) => (
        <>
          <DemoHeader />
          {effect}
          <ReducedMotionNotice>
            <div
              aria-live="polite"
              className="pointer-events-none absolute bottom-4 right-4 z-40 w-fit max-w-65 rounded-md bg-black/10 p-3 text-center backdrop-blur-md max-md:hidden"
            >
              <h2 className="text-sm leading-none text-black">
                The lens keeps tracking.
              </h2>
              <p className="mt-2 text-xs leading-5 text-black">
                Liquid Glass Cursor magnifies and refracts whatever your cursor
                passes over. Since the lens is driven entirely by cursor motion,
                there&apos;s no reduced motion version to fall back on.
              </p>
            </div>
          </ReducedMotionNotice>
        </>
      )}
    </RegistryRemixerDemo>
  );
}
