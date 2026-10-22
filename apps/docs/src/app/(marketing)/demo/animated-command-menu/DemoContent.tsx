"use client";

import AnimatedCommand, { getThemeProps, type AnimatedCommandTheme, type AnimatedCommandMode } from "@/components/animated-command-menu";
import HeadAnim from "@/components/Animations/HeadAnim";
import DemoHeader from "@/components/preview-chrome/DemoHeader";
import SplitLine from "@/components/WebsiteComps/SplitLine";
import LocalRemixerDemo from "@/components/local-remixer/LocalRemixerDemo";

export default function DemoContent() {
  return (
    <LocalRemixerDemo
      name="animated-command-menu"
      category="components"
      render={(values) => (
        <AnimatedCommand {...values} className="p-[2vw] max-md:p-[5vw]" />
      )}
      props={[
        { name: "theme", label: "Theme", type: "string", default: "default", description: "Colour palette for every part, popups included.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Default", value: "default" }, { label: "Caffeine", value: "caffeine" }, { label: "Claude", value: "claude" }, { label: "Ghibli", value: "ghibli" }, { label: "Spotify", value: "spotify" }, { label: "Valorant", value: "valorant" }, { label: "Vscode", value: "vscode" }] } },
        { name: "mode", label: "Mode", type: "string", default: "light", description: "Light or dark version of the palette.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Light", value: "light" }, { label: "Dark", value: "dark" }] } },
        { name: "dropdownAnimation", label: "Dropdown animation", type: "string", default: "morph", description: "Dropdown animation", remixer: { control: "select", group: "dropdown", groupTitle: "Dropdown", options: [{ label: "Morph", value: "morph" }, { label: "Slide", value: "slide" }, { label: "Fade", value: "fade" }] } },
        { name: "morphWidth", label: "Morph width", type: "number", default: 1.25, description: "Morph width", remixer: { control: "range", group: "dropdown", groupTitle: "Dropdown", min: 1, max: 1.6, step: 0.05 } },
        { name: "delay", label: "Delay", type: "number", default: 0.15, description: "Delay", remixer: { control: "range", group: "palette", groupTitle: "Palette", min: 0, max: 1, step: 0.05 } },
        { name: "fadeContent", label: "Fade content", type: "boolean", default: true, description: "Fade content", remixer: { control: "checkbox", group: "palette", groupTitle: "Palette" } },
        { name: "startScale", label: "Start scale", type: "number", default: 0.75, description: "Start scale", remixer: { control: "range", group: "palette", groupTitle: "Palette", min: 0.5, max: 1, step: 0.05 } },
        { name: "backdrop", label: "Backdrop", type: "string", default: "blur", description: "Backdrop", remixer: { control: "select", group: "palette", groupTitle: "Palette", options: [{ label: "None", value: "none" }, { label: "Dim", value: "dim" }, { label: "Blur", value: "blur" }] } },
        { name: "rounded", label: "Roundness", type: "string", default: "sm", description: "Roundness", remixer: { control: "select", group: "both", groupTitle: "Both", options: [{ label: "None", value: "none" }, { label: "sm", value: "sm" }, { label: "md", value: "md" }, { label: "lg", value: "lg" }, { label: "xl", value: "xl" }, { label: "2xl", value: "2xl" }, { label: "3xl", value: "3xl" }] } },
        { name: "itemHighlight", label: "Item highlight", type: "string", default: "slide", description: "Item highlight", remixer: { control: "select", group: "both", groupTitle: "Both", options: [{ label: "Slide", value: "slide" }, { label: "Fill from top", value: "fill" }, { label: "None", value: "none" }] } },
        { name: "itemHighlightColor", label: "Item highlight color", type: "string", default: "primary", description: "Item highlight color", remixer: { control: "select", group: "both", groupTitle: "Both", options: [{ label: "Muted", value: "muted" }, { label: "Primary", value: "primary" }] } },
        { name: "animateIcon", label: "Animate icon", type: "boolean", default: true, description: "Animate icon", remixer: { control: "checkbox", group: "both", groupTitle: "Both" } },
        { name: "duration", label: "Duration", type: "number", default: 0.35, description: "Duration", remixer: { control: "range", group: "both", groupTitle: "Both", min: 0.1, max: 1, step: 0.05 } },
        { name: "bounce", label: "Bounce", type: "number", default: 0.15, description: "Bounce", remixer: { control: "range", group: "both", groupTitle: "Both", min: 0, max: 0.6, step: 0.05 } },
        { name: "rollingText", label: "Rolling text", type: "boolean", default: false, description: "Rolling text", remixer: { control: "checkbox", group: "both", groupTitle: "Both" } },
        { name: "staggerItems", label: "Stagger items", type: "boolean", default: true, description: "Stagger items", remixer: { control: "checkbox", group: "both", groupTitle: "Both" } },
        { name: "stagger", label: "Stagger", type: "number", default: 0.03, description: "Stagger", remixer: { control: "range", group: "both", groupTitle: "Both", min: 0, max: 0.15, step: 0.01 } },
      ]}
    >
      {({ values, effect }) => (
        <>
          <DemoHeader />
          <div
            {...getThemeProps(values.theme as AnimatedCommandTheme, values.mode as AnimatedCommandMode)}
            className="flex min-h-screen w-full flex-col items-center gap-[3vw] bg-(--hx-background) px-[5vw] py-[7%] text-(--hx-foreground) transition-colors duration-500 max-md:gap-[8vw] max-md:py-[25%]"
          >
            <div className="flex flex-col items-center gap-[1vw]">
              <HeadAnim>
                <h1 className="text-[4vw] max-md:text-[7vw] max-sm:text-[9vw]">Animated Command Menu</h1>
              </HeadAnim>
              <SplitLine>
                <p className="text-center max-md:w-[80vw]">A searchable list of commands, opened with a shortcut.</p>
              </SplitLine>
            </div>
            <div className="w-[60vw] max-md:w-full">{effect}</div>
          </div>
        </>
      )}
    </LocalRemixerDemo>
  );
}
