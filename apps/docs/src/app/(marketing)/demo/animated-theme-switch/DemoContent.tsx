"use client";

import { useState } from "react";
import AnimatedThemeSwitch, { getThemeProps, type AnimatedThemeSwitchTheme, type AnimatedThemeSwitchMode } from "@/components/animated-theme-switch";
import HeadAnim from "@/components/Animations/HeadAnim";
import DemoHeader from "@/components/preview-chrome/DemoHeader";
import SplitLine from "@/components/WebsiteComps/SplitLine";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";

export default function DemoContent({ registry }: { registry: any }) {
  // The switch owns the mode, so the whole page follows it and the reveal spreads over the page, not a box
  const [mode, setMode] = useState<AnimatedThemeSwitchMode>("dark");

  return (
    <RegistryRemixerDemo registry={registry}
      render={(values) => (
        <AnimatedThemeSwitch {...values} mode={mode} onModeChange={setMode} />
      )}
    >
      {({ values, effect }) => (
        <>
          <DemoHeader />
          <div
            {...getThemeProps(values.theme as AnimatedThemeSwitchTheme, mode)}
            className="flex min-h-screen w-full flex-col items-center gap-[3vw] bg-(--hx-background) px-[5vw] pt-[12%] text-(--hx-foreground) max-lg:gap-[6vw] max-lg:pt-[20%] max-md:gap-[8vw] max-md:pt-[35%]"
          >
            <div className="flex w-full flex-col items-center gap-[1vw] max-lg:gap-[2vw]">
              <HeadAnim>
                <h1 className="text-center text-[4vw] max-lg:text-[6vw] max-md:text-[7vw] max-sm:text-[9vw]">Animated Theme Switch</h1>
              </HeadAnim>
              <SplitLine>
                <p className="text-center max-lg:w-[80vw]">Switch between light and dark with a transition.</p>
              </SplitLine>
            </div>
            <div className="w-[60vw] max-lg:w-[85vw] max-md:w-full">{effect}</div>
          </div>
        </>
      )}
    </RegistryRemixerDemo>
  );
}
