"use client";

import AnimatedButtonSet, { getThemeProps, type AnimatedButtonSetTheme, type AnimatedButtonSetMode } from "@/components/animated-button";
import HeadAnim from "@/components/Animations/HeadAnim";
import DemoHeader from "@/components/preview-chrome/DemoHeader";
import SplitLine from "@/components/WebsiteComps/SplitLine";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";

export default function DemoContent({ registry }: { registry: any }) {
  return (
    <RegistryRemixerDemo registry={registry}
      render={(values) => (
        <AnimatedButtonSet {...values} className=" max-md:p-[5vw]" />
      )}
    >
      {({ values, effect }) => (
        <>
          <DemoHeader />
          <div
            {...getThemeProps(values.theme as AnimatedButtonSetTheme, values.mode as AnimatedButtonSetMode)}
            className="flex min-h-screen w-full flex-col items-center gap-[3vw] bg-(--hx-background) px-[5vw] pt-[10%] text-(--hx-foreground) motion-reduce:transition-none max-lg:gap-[6vw] max-lg:py-[15%] max-md:gap-[8vw] max-md:pt-[25%]"
          >
            <div className="flex w-full flex-col items-center gap-[1vw] max-lg:gap-[2vw]">
              <HeadAnim>
                <h1 className="text-center text-[4vw] max-lg:text-[6vw] max-md:text-[7vw] max-sm:text-[9vw]">Animated Button</h1>
              </HeadAnim>
              <SplitLine>
                <p className="text-center max-lg:w-[80vw]">Buttons with hover, press and loading animations.</p>
              </SplitLine>
            </div>
            <div className="w-[60vw] max-lg:w-[85vw] max-md:w-full">{effect}</div>
          </div>
        </>
      )}
    </RegistryRemixerDemo>
  );
}
