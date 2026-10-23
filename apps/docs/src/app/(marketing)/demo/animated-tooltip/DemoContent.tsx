"use client";

import AnimatedTooltip, { getThemeProps, type AnimatedTooltipTheme, type AnimatedTooltipMode } from "@/components/animated-tooltip";
import HeadAnim from "@/components/Animations/HeadAnim";
import DemoHeader from "@/components/preview-chrome/DemoHeader";
import SplitLine from "@/components/WebsiteComps/SplitLine";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";

export default function DemoContent({ registry }: { registry: any }) {
  return (
    <RegistryRemixerDemo registry={registry}
      render={(values) => (
        <AnimatedTooltip {...values} className="p-[2vw] max-md:p-[5vw]" />
      )}
    >
      {({ values, effect }) => (
        <>
          <DemoHeader />
          <div
            {...getThemeProps(values.theme as AnimatedTooltipTheme, values.mode as AnimatedTooltipMode)}
            className="flex min-h-screen w-full flex-col items-center gap-[3vw] bg-(--hx-background) px-[5vw] pt-[10%] text-(--hx-foreground) motion-reduce:transition-none max-lg:gap-[6vw] max-lg:py-[15%] max-md:gap-[8vw] max-md:py-[25%]"
          >
            <div className="flex w-full flex-col items-center gap-[1vw] max-lg:gap-[2vw]">
              <HeadAnim>
                <h1 className="text-center text-[4vw] max-lg:text-[6vw] max-md:text-[7vw] max-sm:text-[9vw]">Animated Tooltip</h1>
              </HeadAnim>
              <SplitLine>
                <p className="text-center max-lg:w-[80vw]">A label that follows the pointer or appears on hover.</p>
              </SplitLine>
            </div>
            <div className="w-[60vw] max-lg:w-[85vw] max-md:w-full">{effect}</div>
          </div>
        </>
      )}
    </RegistryRemixerDemo>
  );
}
