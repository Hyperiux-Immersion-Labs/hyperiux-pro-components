"use client";

import CursorMove from "@/components/cursor-move";
import DemoHeader from "@/components/WebsiteComps/DemoHeader";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";
import ReducedMotionNotice from "@/components/WebsiteComps/ReducedMotionNotice";

export default function DemoContent({ registry }: { registry: any }) {
  return (
    <RegistryRemixerDemo
      registry={registry}
      render={(values: any) => (
        <CursorMove
          {...values}
          textAs="h1"
          backgroundClassName="bg-zinc-950"
        />
      )}
      copyCodeOptions={{ propsVariableName: "cursorMoveProps" }}
    >
      {({ effect }) => (
        <>
          <DemoHeader logoColor="#FFFFFF" textColor="#ffffff" />
          {effect}
          <ReducedMotionNotice>
            <div
              aria-live="polite"
              className="pointer-events-none fixed bottom-4 right-4 z-40 w-fit max-w-65 rounded-md border border-white/15 bg-white/5 p-3 text-center backdrop-blur-sm max-[1025px]:hidden"
            >
              <h2 className="text-sm leading-none text-white">
                The letters keep bending.
              </h2>
              <p className="mt-2 text-xs leading-5 text-white/65">
                Cursor Move warps text and tracks coordinates live as you move
                the cursor. The animation is the interaction itself, so it
                can&apos;t be reduced.
              </p>
            </div>
          </ReducedMotionNotice>
          <div className="absolute bottom-[3vw] left-1/2 -translate-x-1/2 z-40 bg-white/8 backdrop-blur-sm px-4 py-2 rounded-full text-white text-[1.05vw] max-md:hidden shadow-lg w-[52vw] text-center">
            Glide your cursor over the screen - the crosshair dances, the letters bend, and the coordinates responds.
          </div>
          <div className="absolute bottom-[10vh] left-1/2 -translate-x-1/2 z-40 bg-white/8 backdrop-blur-sm px-7 py-4 rounded-[3vw] text-white text-[2.5vw] max-sm:text-[4vw] hidden max-md:block w-[45%] max-sm:w-[80%] text-center mx-auto">
            Open on desktop to experience the effect as intended.
          </div>
        </>
      )}
    </RegistryRemixerDemo>
  );
}
