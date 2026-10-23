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
        { name: "theme", label: "Theme", type: "string", default: "default", description: "Colour palette, menu included. The highlighted item and the selection pill take its primary colour.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Default", value: "default" }, { label: "Caffeine", value: "caffeine" }, { label: "Claude", value: "claude" }, { label: "Ghibli", value: "ghibli" }, { label: "Spotify", value: "spotify" }, { label: "Valorant", value: "valorant" }, { label: "Vscode", value: "vscode" }] } },
        { name: "mode", label: "Mode", type: "string", default: "dark", description: "Light or dark version of the palette. Starts dark.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Light", value: "light" }, { label: "Dark", value: "dark" }] } },
        { name: "animation", label: "Animation", type: "string", default: "collapse", description: "How the menu opens: collapse, slide, scale, reveal or morph.", remixer: { control: "select", group: "panel", groupTitle: "Panel", options: [{ label: "Collapse", value: "collapse" }, { label: "Slide", value: "slide" }, { label: "Scale", value: "scale" }, { label: "Reveal", value: "reveal" }, { label: "Morph", value: "morph" }], hideWhenReducedMotion: true } },
        { name: "exitFast", label: "Exit fast", type: "boolean", default: false, description: "The menu closes faster than it opens.", remixer: { control: "checkbox", group: "panel", groupTitle: "Panel", hideWhenReducedMotion: true } },
        { name: "duration", label: "Duration", type: "number", default: 0.35, description: "How long the open animation takes, in seconds.", remixer: { control: "range", group: "timing", groupTitle: "Timing", min: 0.1, max: 1, step: 0.05, hideWhenReducedMotion: true } },
        { name: "delay", label: "Delay", type: "number", default: 0.1, description: "Wait before the menu starts opening, in seconds.", remixer: { control: "range", group: "timing", groupTitle: "Timing", min: 0, max: 0.5, step: 0.01, hideWhenReducedMotion: true } },
        { name: "stagger", label: "Stagger", type: "number", default: 0.05, description: "Delay between each item appearing, in seconds.", remixer: { control: "range", group: "timing", groupTitle: "Timing", min: 0, max: 0.2, step: 0.01, hideWhenReducedMotion: true } },
        { name: "itemHighlight", label: "Item highlight", type: "string", default: "slide", description: "How the highlight moves between items: slides, fills from the top, or none.", remixer: { control: "select", group: "options", groupTitle: "Options", options: [{ label: "Slide", value: "slide" }, { label: "Fill from top", value: "fill" }, { label: "None", value: "none" }], hideWhenReducedMotion: true } },
        { name: "selectionIndicator", label: "Selection indicator", type: "string", default: "check", description: "Mark shown on the chosen item: check, dot or bar.", remixer: { control: "select", group: "options", groupTitle: "Options", options: [{ label: "Check", value: "check" }, { label: "Dot", value: "dot" }, { label: "Bar", value: "bar" }] } },
        { name: "showDescriptions", label: "Descriptions", type: "boolean", default: false, description: "Shows a short description under each item.", remixer: { control: "checkbox", group: "options", groupTitle: "Options" } },
        { name: "bold", label: "Bold", type: "boolean", default: false, description: "Makes the item labels bold.", remixer: { control: "checkbox", group: "options", groupTitle: "Options" } },
        { name: "rollingText", label: "Rolling text", type: "boolean", default: false, description: "Item labels roll to a second copy on hover.", remixer: { control: "checkbox", group: "options", groupTitle: "Options", hideWhenReducedMotion: true } },
        { name: "icon", label: "Icon", type: "string", default: "plus", description: "Icon on the trigger: plus that turns to minus, or a chevron.", remixer: { control: "select", group: "trigger", groupTitle: "Trigger", options: [{ label: "Plus / minus", value: "plus" }, { label: "Chevron", value: "chevron" }] } },
        { name: "rollingValue", label: "Rolling value", type: "boolean", default: true, description: "The chosen value in the trigger rolls to the new one when it changes.", remixer: { control: "checkbox", group: "trigger", groupTitle: "Trigger", hideWhenReducedMotion: true } },
        { name: "pressFeedback", label: "Press feedback", type: "boolean", default: false, description: "Items squeeze slightly when pressed.", remixer: { control: "checkbox", group: "trigger", groupTitle: "Trigger", hideWhenReducedMotion: true } },
        { name: "openOnHover", label: "Open on hover", type: "boolean", default: false, description: "Opens the menu when you hover the trigger, not only on click.", remixer: { control: "checkbox", group: "trigger", groupTitle: "Trigger" } },
        { name: "closeDelayOnSelect", label: "Close delay on select", type: "boolean", default: false, description: "Waits a moment after a pick so you see the selection before the menu closes.", remixer: { control: "checkbox", group: "behaviour", groupTitle: "Behaviour" } },
        { name: "typeahead", label: "Type to jump", type: "boolean", default: false, description: "Typing a letter jumps to the item that starts with it.", remixer: { control: "checkbox", group: "behaviour", groupTitle: "Behaviour" } },
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
                <h1 className="text-center text-[4vw] max-md:text-[7vw] max-sm:text-[9vw]">Animated Dropdown Menu</h1>
              </HeadAnim>
              <SplitLine>
                <p className="text-center max-md:w-[80vw]">A menu of actions or options that opens from a button.</p>
              </SplitLine>
            </div>
            <div className="w-[60vw] max-lg:w-[85vw] max-md:w-full">{effect}</div>
          </div>
        </>
      )}
    </LocalRemixerDemo>
  );
}
