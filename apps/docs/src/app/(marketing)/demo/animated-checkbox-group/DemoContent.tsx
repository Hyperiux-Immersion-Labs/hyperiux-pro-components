"use client";

import AnimatedCheckboxGroup, { getThemeProps, type CheckboxMode, type CheckboxTheme } from "@/components/animated-checkbox-group";
import HeadAnim from "@/components/Animations/HeadAnim";
import DemoHeader from "@/components/preview-chrome/DemoHeader";
import SplitLine from "@/components/WebsiteComps/SplitLine";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";

export default function DemoContent({ registry }: { registry: any }) {
  return (
    <RegistryRemixerDemo registry={registry} component={AnimatedCheckboxGroup}>
      {({ values, effect }) => (
        <>
          <DemoHeader />
          <div
            {...getThemeProps(values.theme as CheckboxTheme, values.mode as CheckboxMode)}
            className="flex min-h-screen w-full flex-col items-center gap-[3vw] bg-(--hx-background) px-[5vw] pt-[10%] text-(--hx-foreground) transition-colors duration-500 max-md:gap-[8vw] max-md:pt-[25%]"
          >
            <div className="flex flex-col items-center gap-[1vw]">
              <HeadAnim>
                <h1 className="text-center text-[4vw] max-md:text-[7vw] max-sm:text-[9vw]">Animated Checkbox Group</h1>
              </HeadAnim>
              <SplitLine>
                <p className="text-center max-md:w-[80vw]">Tick any number of options.<span className="max-lg:hidden"> Shift-click ticks a range.</span></p>
              </SplitLine>
            </div>
            <div className="w-[50vw] max-lg:w-[85vw] max-md:w-full">{effect}</div>
          </div>
        </>
      )}
    </RegistryRemixerDemo>
  );
}
