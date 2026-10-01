"use client";

import CoffeeBeanCursor from "@/components/coffee-bean-cursor";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import ReducedMotionNotice from "@/components/WebsiteComps/ReducedMotionNotice";

export default function DemoContent({ registry }: { registry: any }) {
  return (
    <RegistryRemixerDemo
      registry={registry}
      component={CoffeeBeanCursor}
      copyCodeOptions={{ propsVariableName: "coffeeBeanCursorProps" }}
    >
      {({ effect }) => (
        <>
          <DemoHeader logoColor="#ffffff" textColor="#ffffff" />
          {effect}
          <ReducedMotionNotice>
            <div
              aria-live="polite"
              className="pointer-events-none fixed bottom-4 right-4 z-40 w-fit max-w-65 rounded-md border border-white/15 bg-white/5 p-3 text-center backdrop-blur-sm max-md:hidden"
            >
              <h2 className="text-sm leading-none text-white">
                The beans keep drifting.
              </h2>
              <p className="mt-2 text-xs leading-5 text-white/65">
                Coffee Bean Cursor animates in direct response to cursor movement.
                The motion is the effect, so it can&apos;t be reduced without
                disabling it entirely.
              </p>
            </div>
          </ReducedMotionNotice>
        </>
      )}
    </RegistryRemixerDemo>
  );
}
