"use client";

import AnimatedTabsBar, { getThemeProps, type AnimatedTabsBarTheme, type AnimatedTabsBarMode } from "@/components/animated-tabs-bar";
import HeadAnim from "@/components/Animations/HeadAnim";
import DemoHeader from "@/components/preview-chrome/DemoHeader";
import SplitLine from "@/components/WebsiteComps/SplitLine";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";

export default function DemoContent({ registry }: { registry: any }) {
  return (
    <RegistryRemixerDemo registry={registry}
      render={(values) => (
        <AnimatedTabsBar {...values} className="p-[2vw] max-md:p-[5vw]" />
      )}
    >
      {({ values, effect }) => (
        <>
          <DemoHeader />
          <div
            {...getThemeProps(values.theme as AnimatedTabsBarTheme, values.mode as AnimatedTabsBarMode)}
            className="flex min-h-screen w-full flex-col items-center gap-[3vw] bg-(--hx-background) px-[5vw] py-[7%] text-(--hx-foreground) transition-colors duration-500 max-md:gap-[8vw] max-md:py-[25%]"
          >
            <div className="flex flex-col items-center gap-[1vw]">
              <HeadAnim>
                <h1 className="text-[4vw] max-md:text-[7vw] max-sm:text-[9vw]">Animated Tabs Bar</h1>
              </HeadAnim>
              <SplitLine>
                <p className="text-center max-md:w-[80vw]">Switch between views; the highlight glides to the active tab.</p>
              </SplitLine>
            </div>
            <div className="w-[60vw] max-lg:w-[85vw] max-md:w-full">{effect}</div>
          </div>
        </>
      )}
    </RegistryRemixerDemo>
  );
}
