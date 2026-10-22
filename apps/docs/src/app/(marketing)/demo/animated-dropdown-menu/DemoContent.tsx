"use client";

import AnimatedDropdownMenu, { getThemeProps, type AnimatedDropdownMenuTheme, type AnimatedDropdownMenuMode } from "@/components/animated-dropdown-menu";
import HeadAnim from "@/components/Animations/HeadAnim";
import DemoHeader from "@/components/preview-chrome/DemoHeader";
import SplitLine from "@/components/WebsiteComps/SplitLine";
import LocalRemixerDemo from "@/components/local-remixer/LocalRemixerDemo";

export default function DemoContent() {
  return (
    <LocalRemixerDemo
      name="animated-dropdown-menu"
      category="components"
      render={(values) => (
        <AnimatedDropdownMenu {...values} className="flex min-h-[60vh] items-start justify-center p-[3vw] max-md:p-[5vw]" />
      )}
      props={[
        { name: "theme", label: "Theme", type: "string", default: "default", description: "Colour palette for every part, popups included.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Default", value: "default" }, { label: "Caffeine", value: "caffeine" }, { label: "Claude", value: "claude" }, { label: "Ghibli", value: "ghibli" }, { label: "Spotify", value: "spotify" }, { label: "Valorant", value: "valorant" }, { label: "Vscode", value: "vscode" }] } },
        { name: "mode", label: "Mode", type: "string", default: "light", description: "Light or dark version of the palette.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Light", value: "light" }, { label: "Dark", value: "dark" }] } },
        { name: "animation", label: "Animation", type: "string", default: "collapse", description: "Animation", remixer: { control: "select", group: "panel", groupTitle: "Panel", options: [{ label: "Collapse", value: "collapse" }, { label: "Slide", value: "slide" }, { label: "Scale", value: "scale" }, { label: "Reveal", value: "reveal" }, { label: "Morph", value: "morph" }] } },
        { name: "exitFast", label: "Exit fast", type: "boolean", default: false, description: "Exit fast", remixer: { control: "checkbox", group: "panel", groupTitle: "Panel" } },
        { name: "duration", label: "Duration", type: "number", default: 0.35, description: "Duration", remixer: { control: "range", group: "timing", groupTitle: "Timing", min: 0.1, max: 1, step: 0.05 } },
        { name: "delay", label: "Delay", type: "number", default: 0.1, description: "Delay", remixer: { control: "range", group: "timing", groupTitle: "Timing", min: 0, max: 0.5, step: 0.01 } },
        { name: "stagger", label: "Stagger", type: "number", default: 0.05, description: "Stagger", remixer: { control: "range", group: "timing", groupTitle: "Timing", min: 0, max: 0.2, step: 0.01 } },
        { name: "itemHighlight", label: "Item highlight", type: "string", default: "slide", description: "Item highlight", remixer: { control: "select", group: "options", groupTitle: "Options", options: [{ label: "Slide", value: "slide" }, { label: "Fill from top", value: "fill" }, { label: "None", value: "none" }] } },
        { name: "selectionIndicator", label: "Selection indicator", type: "string", default: "check", description: "Selection indicator", remixer: { control: "select", group: "options", groupTitle: "Options", options: [{ label: "Check", value: "check" }, { label: "Dot", value: "dot" }, { label: "Bar", value: "bar" }] } },
        { name: "showDescriptions", label: "Descriptions", type: "boolean", default: false, description: "Descriptions", remixer: { control: "checkbox", group: "options", groupTitle: "Options" } },
        { name: "bold", label: "Bold", type: "boolean", default: false, description: "Bold", remixer: { control: "checkbox", group: "options", groupTitle: "Options" } },
        { name: "rollingText", label: "Rolling text", type: "boolean", default: false, description: "Rolling text", remixer: { control: "checkbox", group: "options", groupTitle: "Options" } },
        { name: "icon", label: "Icon", type: "string", default: "plus", description: "Icon", remixer: { control: "select", group: "trigger", groupTitle: "Trigger", options: [{ label: "Plus / minus", value: "plus" }, { label: "Chevron", value: "chevron" }] } },
        { name: "rollingValue", label: "Rolling value", type: "boolean", default: true, description: "Rolling value", remixer: { control: "checkbox", group: "trigger", groupTitle: "Trigger" } },
        { name: "pressFeedback", label: "Press feedback", type: "boolean", default: false, description: "Press feedback", remixer: { control: "checkbox", group: "trigger", groupTitle: "Trigger" } },
        { name: "openOnHover", label: "Open on hover", type: "boolean", default: false, description: "Open on hover", remixer: { control: "checkbox", group: "trigger", groupTitle: "Trigger" } },
        { name: "closeDelayOnSelect", label: "Close delay on select", type: "boolean", default: false, description: "Close delay on select", remixer: { control: "checkbox", group: "behaviour", groupTitle: "Behaviour" } },
        { name: "typeahead", label: "Type to jump", type: "boolean", default: false, description: "Type to jump", remixer: { control: "checkbox", group: "behaviour", groupTitle: "Behaviour" } },
      ]}
    >
      {({ values, effect }) => (
        <>
          <DemoHeader />
          <div
            {...getThemeProps(values.theme as AnimatedDropdownMenuTheme, values.mode as AnimatedDropdownMenuMode)}
            className="flex min-h-screen w-full flex-col items-center gap-[3vw] bg-(--hx-background) px-[5vw] py-[7%] text-(--hx-foreground) transition-colors duration-500 max-md:gap-[8vw] max-md:py-[25%]"
          >
            <div className="flex flex-col items-center gap-[1vw]">
              <HeadAnim>
                <h1 className="text-[4vw] max-md:text-[7vw] max-sm:text-[9vw]">Animated Dropdown Menu</h1>
              </HeadAnim>
              <SplitLine>
                <p className="text-center max-md:w-[80vw]">A menu of actions or options that opens from a button.</p>
              </SplitLine>
            </div>
            <div className="w-[60vw] max-md:w-full">{effect}</div>
          </div>
        </>
      )}
    </LocalRemixerDemo>
  );
}
