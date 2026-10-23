"use client";

import AnimatedDataTable, { getThemeProps, type AnimatedDataTableTheme, type AnimatedDataTableMode } from "@/components/animated-data-table";
import HeadAnim from "@/components/Animations/HeadAnim";
import DemoHeader from "@/components/preview-chrome/DemoHeader";
import SplitLine from "@/components/WebsiteComps/SplitLine";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";

export default function DemoContent({ registry }: { registry: any }) {
  return (
    <RegistryRemixerDemo registry={registry}
      render={(values) => (
        <AnimatedDataTable {...values} className="p-[2vw] max-md:p-[5vw]" />
      )}
    >
      {({ values, effect }) => (
        <>
          <DemoHeader />
          <div
            {...getThemeProps(values.theme as AnimatedDataTableTheme, values.mode as AnimatedDataTableMode)}
            className="flex min-h-screen w-full flex-col items-center gap-[3vw] bg-(--hx-background) px-[5vw] py-[7%] text-(--hx-foreground) transition-colors duration-500 max-md:gap-[8vw] max-md:py-[25%]"
          >
            <div className="flex flex-col items-center gap-[1vw]">
              <HeadAnim>
                <h1 className="text-center text-[4vw] max-md:text-[7vw] max-sm:text-[9vw]">Animated Data Table</h1>
              </HeadAnim>
              <SplitLine>
                <p className="text-center max-md:w-[80vw]">Sort, filter, select and reorder rows that glide into place.</p>
              </SplitLine>
            </div>
            <div className="w-[80vw] max-md:w-full">{effect}</div>
          </div>
        </>
      )}
    </RegistryRemixerDemo>
  );
}
