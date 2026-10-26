"use client";

import AnimatedSidebar, { getThemeProps, type AnimatedSidebarTheme, type AnimatedSidebarMode } from "@/components/animated-sidebar";
import HeadAnim from "@/components/Animations/HeadAnim";
import DemoHeader from "@/components/preview-chrome/DemoHeader";
import SplitLine from "@/components/WebsiteComps/SplitLine";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";

export default function DemoContent({ registry }: { registry: any }) {
  return (
    <RegistryRemixerDemo registry={registry}
      render={(values) => (
        <AnimatedSidebar {...values} className="h-[85vh] overflow-hidden [transform:translateZ(0)] p-0" />
      )}
    >
      {({ values, effect }) => (
        <>
          <DemoHeader />
          <div
            {...getThemeProps(values.theme as AnimatedSidebarTheme, values.mode as AnimatedSidebarMode)}
            className="flex min-h-screen w-full flex-col items-center gap-[3vw] bg-(--hx-background) px-[5vw] py-[7%] text-(--hx-foreground) transition-colors duration-500 max-md:gap-[8vw] max-md:pt-[25%]"
          >
            <div className="flex flex-col items-center gap-[1vw]">
              <HeadAnim>
                <h1 className="text-[4vw] max-md:text-[7vw] max-sm:text-[9vw]">Animated Sidebar</h1>
              </HeadAnim>
              <SplitLine>
                <p className="text-center max-md:w-[80vw]">A collapsible side navigation with groups, badges and sub-menus.</p>
              </SplitLine>
            </div>
            <div className="w-[90vw] max-md:w-full">{effect}</div>
          </div>
        </>
      )}
    </RegistryRemixerDemo>
  );
}
