"use client";

import AnimatedDrawer, { getThemeProps, type AnimatedDrawerTheme, type AnimatedDrawerMode } from "@/components/animated-drawer";
import HeadAnim from "@/components/Animations/HeadAnim";
import DemoHeader from "@/components/preview-chrome/DemoHeader";
import SplitLine from "@/components/WebsiteComps/SplitLine";
import LocalRemixerDemo from "@/components/local-remixer/LocalRemixerDemo";

export default function DemoContent() {
  return (
    <LocalRemixerDemo
      name="animated-drawer"
      category="components"
      render={(values) => (
        <AnimatedDrawer {...values} className="p-[2vw] max-md:p-[5vw]" />
      )}
      props={[
        { name: "theme", label: "Theme", type: "string", default: "default", description: "Colour palette for every part, popups included.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Default", value: "default" }, { label: "Caffeine", value: "caffeine" }, { label: "Claude", value: "claude" }, { label: "Ghibli", value: "ghibli" }, { label: "Spotify", value: "spotify" }, { label: "Valorant", value: "valorant" }, { label: "Vscode", value: "vscode" }] } },
        { name: "mode", label: "Mode", type: "string", default: "light", description: "Light or dark version of the palette.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Light", value: "light" }, { label: "Dark", value: "dark" }] } },
        { name: "rollingText", label: "Rolling text", type: "boolean", default: true, description: "Rolling text", remixer: { control: "checkbox", group: "button", groupTitle: "Button" } },
        { name: "fillOnHover", label: "Fill on hover", type: "boolean", default: false, description: "Fill on hover", remixer: { control: "checkbox", group: "button", groupTitle: "Button" } },
        { name: "side", label: "Side", type: "string", default: "bottom", description: "Side", remixer: { control: "select", group: "drawer", groupTitle: "Drawer", options: [{ label: "Bottom", value: "bottom" }, { label: "Top", value: "top" }, { label: "Left", value: "left" }, { label: "Right", value: "right" }] } },
        { name: "showSwipeHandle", label: "Swipe handle", type: "boolean", default: true, description: "Swipe handle", remixer: { control: "checkbox", group: "drawer", groupTitle: "Drawer" } },
        { name: "openAnimation", label: "Opens with", type: "string", default: "slide", description: "Opens with", remixer: { control: "select", group: "motion", groupTitle: "Motion", options: [{ label: "Slide", value: "slide" }, { label: "Fade", value: "fade" }] } },
        { name: "elastic", label: "Elastic", type: "boolean", default: true, description: "Elastic", remixer: { control: "checkbox", group: "motion", groupTitle: "Motion" } },
        { name: "duration", label: "Duration", type: "number", default: 0.5, description: "Duration", remixer: { control: "range", group: "motion", groupTitle: "Motion", min: 0.2, max: 1.2, step: 0.05 } },
        { name: "bounce", label: "Bounce", type: "number", default: 0.2, description: "Bounce", remixer: { control: "range", group: "motion", groupTitle: "Motion", min: 0, max: 0.6, step: 0.05 } },
        { name: "stagger", label: "Stagger", type: "number", default: 0.04, description: "Stagger", remixer: { control: "range", group: "motion", groupTitle: "Motion", min: 0, max: 0.15, step: 0.01 } },
        { name: "tiltOnSwipe", label: "Tilt on swipe", type: "boolean", default: false, description: "Tilt on swipe", remixer: { control: "checkbox", group: "motion", groupTitle: "Motion" } },
        { name: "scaleBackground", label: "Shrink page behind", type: "boolean", default: true, description: "Shrink page behind", remixer: { control: "checkbox", group: "motion", groupTitle: "Motion" } },
      ]}
    >
      {({ values, effect }) => (
        <>
          <DemoHeader />
          <div
            {...getThemeProps(values.theme as AnimatedDrawerTheme, values.mode as AnimatedDrawerMode)}
            className="flex min-h-screen w-full flex-col items-center gap-[3vw] bg-(--hx-background) px-[5vw] py-[7%] text-(--hx-foreground) transition-colors duration-500 max-md:gap-[8vw] max-md:py-[25%]"
          >
            <div className="flex flex-col items-center gap-[1vw]">
              <HeadAnim>
                <h1 className="text-[4vw] max-md:text-[7vw] max-sm:text-[9vw]">Animated Drawer</h1>
              </HeadAnim>
              <SplitLine>
                <p className="text-center max-md:w-[80vw]">A panel that slides in from the edge and can be swiped away.</p>
              </SplitLine>
            </div>
            <div className="w-[60vw] max-md:w-full">{effect}</div>
          </div>
        </>
      )}
    </LocalRemixerDemo>
  );
}
