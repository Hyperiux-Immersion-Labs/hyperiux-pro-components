"use client";

import AnimatedAttachment, { getThemeProps, type AnimatedAttachmentTheme, type AnimatedAttachmentMode } from "@/components/animated-attachment";
import HeadAnim from "@/components/Animations/HeadAnim";
import DemoHeader from "@/components/preview-chrome/DemoHeader";
import SplitLine from "@/components/WebsiteComps/SplitLine";
import LocalRemixerDemo from "@/components/local-remixer/LocalRemixerDemo";

export default function DemoContent() {
  return (
    <LocalRemixerDemo
      name="animated-attachment"
      category="components"
      render={(values) => (
        <AnimatedAttachment {...values} className="p-[2vw] max-md:p-[5vw]" />
      )}
      props={[
        { name: "theme", label: "Theme", type: "string", default: "default", description: "Colour palette for every part, popups included.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Default", value: "default" }, { label: "Caffeine", value: "caffeine" }, { label: "Claude", value: "claude" }, { label: "Ghibli", value: "ghibli" }, { label: "Spotify", value: "spotify" }, { label: "Valorant", value: "valorant" }, { label: "Vscode", value: "vscode" }] } },
        { name: "mode", label: "Mode", type: "string", default: "light", description: "Light or dark version of the palette.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Light", value: "light" }, { label: "Dark", value: "dark" }] } },
        { name: "animateEnter", label: "Animate enter", type: "boolean", default: true, description: "Animate enter", remixer: { control: "checkbox", group: "adding", groupTitle: "Adding" } },
        { name: "stagger", label: "Stagger", type: "number", default: 0.08, description: "Stagger", remixer: { control: "range", group: "adding", groupTitle: "Adding", min: 0, max: 0.3, step: 0.01 } },
        { name: "flyIn", label: "Fly in from drop", type: "boolean", default: true, description: "Fly in from drop", remixer: { control: "checkbox", group: "adding", groupTitle: "Adding" } },
        { name: "animatedBorder", label: "Animated border", type: "boolean", default: true, description: "Animated border", remixer: { control: "checkbox", group: "adding", groupTitle: "Adding" } },
        { name: "animateExit", label: "Animate exit", type: "boolean", default: true, description: "Animate exit", remixer: { control: "checkbox", group: "layout", groupTitle: "Layout" } },
        { name: "rollingNumbers", label: "Rolling numbers", type: "boolean", default: true, description: "Rolling numbers", remixer: { control: "checkbox", group: "progress", groupTitle: "Progress" } },
        { name: "shimmerText", label: "Shimmer text", type: "boolean", default: true, description: "Shimmer text", remixer: { control: "checkbox", group: "progress", groupTitle: "Progress" } },
        { name: "borderTrace", label: "Border trace", type: "boolean", default: true, description: "Border trace", remixer: { control: "checkbox", group: "progress", groupTitle: "Progress" } },
        { name: "fill", label: "Card fill (images)", type: "boolean", default: true, description: "Card fill (images)", remixer: { control: "checkbox", group: "progress", groupTitle: "Progress" } },
        { name: "fillDirection", label: "Fill direction", type: "string", default: "bottom-to-top", description: "Fill direction", remixer: { control: "select", group: "progress", groupTitle: "Progress", options: [{ label: "Left to right", value: "left-to-right" }, { label: "Bottom to top", value: "bottom-to-top" }] } },
        { name: "shakeOnError", label: "Shake on error", type: "boolean", default: true, description: "Shake on error", remixer: { control: "checkbox", group: "states", groupTitle: "States" } },
        { name: "revealAction", label: "Reveal action", type: "boolean", default: true, description: "Reveal action", remixer: { control: "checkbox", group: "hover", groupTitle: "Hover" } },
        { name: "zoomOnHover", label: "Zoom on hover", type: "boolean", default: true, description: "Zoom on hover", remixer: { control: "checkbox", group: "hover", groupTitle: "Hover" } },
        { name: "blurUntilLoaded", label: "Blur until loaded", type: "boolean", default: true, description: "Blur until loaded", remixer: { control: "checkbox", group: "hover", groupTitle: "Hover" } },
        { name: "reorder", label: "Drag to reorder", type: "boolean", default: true, description: "Drag to reorder", remixer: { control: "checkbox", group: "group", groupTitle: "Group" } },
        { name: "tiltOnScroll", label: "Tilt on scroll", type: "boolean", default: false, description: "Tilt on scroll", remixer: { control: "checkbox", group: "group", groupTitle: "Group" } },
        { name: "wrap", label: "Wrap", type: "boolean", default: false, description: "Wrap", remixer: { control: "checkbox", group: "group", groupTitle: "Group" } },
        { name: "expandable", label: "Expandable preview", type: "boolean", default: true, description: "Expandable preview", remixer: { control: "checkbox", group: "group", groupTitle: "Group" } },
        { name: "simulateFailures", label: "Simulate failures", type: "boolean", default: true, description: "Simulate failures", remixer: { control: "checkbox", group: "demo", groupTitle: "Demo" } },
      ]}
    >
      {({ values, effect }) => (
        <>
          <DemoHeader />
          <div
            {...getThemeProps(values.theme as AnimatedAttachmentTheme, values.mode as AnimatedAttachmentMode)}
            className="flex min-h-screen w-full flex-col items-center gap-[3vw] bg-(--hx-background) px-[5vw] py-[7%] text-(--hx-foreground) transition-colors duration-500 max-md:gap-[8vw] max-md:py-[25%]"
          >
            <div className="flex flex-col items-center gap-[1vw]">
              <HeadAnim>
                <h1 className="text-[4vw] max-md:text-[7vw] max-sm:text-[9vw]">Animated Attachment</h1>
              </HeadAnim>
              <SplitLine>
                <p className="text-center max-md:w-[80vw]">File chips that show upload progress, errors and previews.</p>
              </SplitLine>
            </div>
            <div className="w-[60vw] max-md:w-full">{effect}</div>
          </div>
        </>
      )}
    </LocalRemixerDemo>
  );
}
