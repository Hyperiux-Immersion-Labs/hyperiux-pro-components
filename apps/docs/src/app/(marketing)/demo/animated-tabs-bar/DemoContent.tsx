"use client";

import AnimatedTabsBar, { getThemeProps, type AnimatedTabsBarTheme, type AnimatedTabsBarMode } from "@/components/animated-tabs-bar";
import HeadAnim from "@/components/Animations/HeadAnim";
import DemoHeader from "@/components/preview-chrome/DemoHeader";
import SplitLine from "@/components/WebsiteComps/SplitLine";
import LocalRemixerDemo from "@/components/local-remixer/LocalRemixerDemo";

export default function DemoContent() {
  return (
    <LocalRemixerDemo
      name="animated-tabs-bar"
      category="components"
      render={(values) => (
        <AnimatedTabsBar {...values} className="p-[2vw] max-md:p-[5vw]" />
      )}
      props={[
        { name: "theme", label: "Theme", type: "string", default: "default", description: "Colour palette for every part, popups included.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Default", value: "default" }, { label: "Caffeine", value: "caffeine" }, { label: "Claude", value: "claude" }, { label: "Ghibli", value: "ghibli" }, { label: "Spotify", value: "spotify" }, { label: "Valorant", value: "valorant" }, { label: "Vscode", value: "vscode" }] } },
        { name: "mode", label: "Mode", type: "string", default: "light", description: "Light or dark version of the palette.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Light", value: "light" }, { label: "Dark", value: "dark" }] } },
        { name: "activeIndicator", label: "Active indicator", type: "string", default: "glide", description: "Active indicator", remixer: { control: "select", group: "tabs", groupTitle: "Tabs", options: [{ label: "Glide pill", value: "glide" }, { label: "Slide underline", value: "underline" }, { label: "Fade underline", value: "fade" }] } },
        { name: "activeColor", label: "Active tab colour", type: "string", default: "primary", description: "Active tab colour", remixer: { control: "select", group: "tabs", groupTitle: "Tabs", options: [{ label: "Primary", value: "primary" }, { label: "Muted", value: "muted" }] } },
        { name: "hoverHighlight", label: "Hover highlight", type: "boolean", default: false, description: "Hover highlight", remixer: { control: "checkbox", group: "tabs", groupTitle: "Tabs" } },
        { name: "divider", label: "Line under tabs", type: "boolean", default: true, description: "Line under tabs", remixer: { control: "checkbox", group: "tabs", groupTitle: "Tabs" } },
        { name: "listBorder", label: "Border on tabs", type: "boolean", default: false, description: "Border on tabs", remixer: { control: "checkbox", group: "tabs", groupTitle: "Tabs" } },
        { name: "panelBorder", label: "Border on content", type: "boolean", default: false, description: "Border on content", remixer: { control: "checkbox", group: "content", groupTitle: "Content" } },
        { name: "rounded", label: "Roundness", type: "string", default: "lg", description: "Roundness", remixer: { control: "select", group: "tabs", groupTitle: "Tabs", options: [{ label: "None", value: "none" }, { label: "sm", value: "sm" }, { label: "md", value: "md" }, { label: "lg", value: "lg" }, { label: "xl", value: "xl" }, { label: "Full", value: "full" }] } },
        { name: "contentAnimation", label: "Content animation", type: "string", default: "slide", description: "Content animation", remixer: { control: "select", group: "content", groupTitle: "Content", options: [{ label: "Slide", value: "slide" }, { label: "Fade in / out", value: "fade" }, { label: "None", value: "none" }] } },
        { name: "slideDistance", label: "Slide distance", type: "number", default: 40, description: "Slide distance", remixer: { control: "range", group: "content", groupTitle: "Content", min: 0, max: 120, step: 4 } },
        { name: "smoothHeight", label: "Smooth panel height", type: "boolean", default: true, description: "Smooth panel height", remixer: { control: "checkbox", group: "content", groupTitle: "Content" } },
        { name: "fadeDuration", label: "Fade duration", type: "number", default: 0.35, description: "Fade duration", remixer: { control: "range", group: "content", groupTitle: "Content", min: 0.1, max: 1.2, step: 0.05 } },
        { name: "duration", label: "Duration", type: "number", default: 0.35, description: "Duration", remixer: { control: "range", group: "motion", groupTitle: "Motion", min: 0.1, max: 1, step: 0.05 } },
        { name: "bounce", label: "Bounce", type: "number", default: 0.15, description: "Bounce", remixer: { control: "range", group: "motion", groupTitle: "Motion", min: 0, max: 0.6, step: 0.05 } },
      ]}
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
            <div className="w-[60vw] max-md:w-full">{effect}</div>
          </div>
        </>
      )}
    </LocalRemixerDemo>
  );
}
