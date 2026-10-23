"use client";

import AnimatedRadioGroup, { getThemeProps, type RadioMode, type RadioTheme } from "@/components/animated-radio-group";
import HeadAnim from "@/components/Animations/HeadAnim";
import DemoHeader from "@/components/preview-chrome/DemoHeader";
import SplitLine from "@/components/WebsiteComps/SplitLine";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";

export default function DemoContent({ registry }: { registry: any }) {
  return (
    <RegistryRemixerDemo registry={registry} component={AnimatedRadioGroup}>
      {({ values, effect }) => (
        <>
          <DemoHeader />
          <div
            {...getThemeProps(values.theme as RadioTheme, values.mode as RadioMode)}
            className="flex min-h-screen w-full flex-col items-center gap-[5vw] bg-(--hx-background) px-[5vw] pt-[12%] text-(--hx-foreground) transition-colors duration-500 max-md:gap-[8vw] max-md:py-[25%]"
          >
            <div className="flex flex-col items-center gap-[1vw]">
              <HeadAnim>
                <h1 className="text-center text-[4vw] max-md:text-[7vw] max-sm:text-[9vw]">Animated Radio Group</h1>
              </HeadAnim>
              <SplitLine>
                <p className="text-center max-md:w-[80vw]">Pick one option.<span className="max-lg:hidden"> Arrow keys, Home and End move the choice.</span></p>
              </SplitLine>
            </div>
            <div className="w-[40vw] max-lg:w-[75vw] max-md:w-full">{effect}</div>
          </div>
        </>
      )}
    </RegistryRemixerDemo>
  );
}
