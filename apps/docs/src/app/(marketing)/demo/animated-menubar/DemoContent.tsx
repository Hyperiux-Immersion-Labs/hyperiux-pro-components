"use client";

import AnimatedMenubar, { getThemeProps, type AnimatedMenubarTheme, type AnimatedMenubarMode } from "@/components/animated-menubar";
import HeadAnim from "@/components/Animations/HeadAnim";
import DemoHeader from "@/components/preview-chrome/DemoHeader";
import SplitLine from "@/components/WebsiteComps/SplitLine";
import LocalRemixerDemo from "@/components/local-remixer/LocalRemixerDemo";

export default function DemoContent() {
  return (
    <LocalRemixerDemo
      name="animated-menubar"
      category="components"
      render={(values) => (
        <AnimatedMenubar {...values} className="p-[2vw] max-md:p-[5vw]" />
      )}
      props={[
        { name: "theme", label: "Theme", type: "string", default: "default", description: "Colour palette for every part, popups included.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Default", value: "default" }, { label: "Caffeine", value: "caffeine" }, { label: "Claude", value: "claude" }, { label: "Ghibli", value: "ghibli" }, { label: "Spotify", value: "spotify" }, { label: "Valorant", value: "valorant" }, { label: "Vscode", value: "vscode" }] } },
        { name: "mode", label: "Mode", type: "string", default: "light", description: "Light or dark version of the palette.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Light", value: "light" }, { label: "Dark", value: "dark" }] } },
        { name: "animation", label: "Opening", type: "string", default: "collapse", description: "Opening", remixer: { control: "select", group: "panel", groupTitle: "Panel", options: [{ label: "Scale", value: "scale" }, { label: "Slide", value: "slide" }, { label: "Collapse", value: "collapse" }, { label: "Reveal", value: "reveal" }] } },
        { name: "exitFast", label: "Exit fast", type: "boolean", default: false, description: "Exit fast", remixer: { control: "checkbox", group: "panel", groupTitle: "Panel" } },
        { name: "switchAnimation", label: "Moving over", type: "string", default: "glide", description: "Moving over", remixer: { control: "select", group: "between-menus", groupTitle: "Between menus", options: [{ label: "Glide", value: "glide" }, { label: "Replay", value: "replay" }] } },
        { name: "contentAnimation", label: "Content animation", type: "string", default: "slide", description: "Content animation", remixer: { control: "select", group: "between-menus", groupTitle: "Between menus", options: [{ label: "Slides in", value: "slide" }, { label: "Fades in", value: "fade" }, { label: "At once", value: "none" }] } },
        { name: "slideDistance", label: "Slide distance", type: "string", default: "lg", description: "Slide distance", remixer: { control: "select", group: "between-menus", groupTitle: "Between menus", options: [{ label: "Small", value: "sm" }, { label: "Medium", value: "md" }, { label: "Large", value: "lg" }] } },
        { name: "duration", label: "Duration", type: "number", default: 0.3, description: "Duration", remixer: { control: "range", group: "timing", groupTitle: "Timing", min: 0.1, max: 1, step: 0.05 } },
        { name: "delay", label: "Delay", type: "number", default: 0.05, description: "Delay", remixer: { control: "range", group: "timing", groupTitle: "Timing", min: 0, max: 0.5, step: 0.01 } },
        { name: "stagger", label: "Stagger", type: "number", default: 0.03, description: "Stagger", remixer: { control: "range", group: "timing", groupTitle: "Timing", min: 0, max: 0.2, step: 0.01 } },
        { name: "triggerHighlight", label: "Menu highlight", type: "string", default: "pill", description: "Menu highlight", remixer: { control: "select", group: "bar", groupTitle: "Bar", options: [{ label: "Gliding pill", value: "pill" }, { label: "Gliding underline", value: "underline" }, { label: "None", value: "none" }] } },
        { name: "triggerHighlightColor", label: "Highlight fill", type: "string", default: "primary", description: "Highlight fill", remixer: { control: "select", group: "bar", groupTitle: "Bar", options: [{ label: "Primary", value: "primary" }, { label: "Muted", value: "muted" }] } },
        { name: "showChevrons", label: "Chevrons", type: "boolean", default: true, description: "Chevrons", remixer: { control: "checkbox", group: "bar", groupTitle: "Bar" } },
        { name: "triggerRollingText", label: "Rolling trigger text", type: "boolean", default: true, description: "Rolling trigger text", remixer: { control: "checkbox", group: "bar", groupTitle: "Bar" } },
        { name: "openOnClick", label: "Open on click", type: "boolean", default: false, description: "Open on click", remixer: { control: "checkbox", group: "bar", groupTitle: "Bar" } },
        { name: "pressFeedback", label: "Press feedback", type: "boolean", default: true, description: "Press feedback", remixer: { control: "checkbox", group: "bar", groupTitle: "Bar" } },
        { name: "itemHighlight", label: "Item highlight", type: "string", default: "slide", description: "Item highlight", remixer: { control: "select", group: "items", groupTitle: "Items", options: [{ label: "Slide", value: "slide" }, { label: "Fill from top", value: "fill" }, { label: "None", value: "none" }] } },
        { name: "itemHighlightColor", label: "Item highlight color", type: "string", default: "primary", description: "Item highlight color", remixer: { control: "select", group: "items", groupTitle: "Items", options: [{ label: "Primary", value: "primary" }, { label: "Muted", value: "muted" }] } },
        { name: "selectionIndicator", label: "Selection indicator", type: "string", default: "check", description: "Selection indicator", remixer: { control: "select", group: "items", groupTitle: "Items", options: [{ label: "Check", value: "check" }, { label: "Dot", value: "dot" }, { label: "Bar", value: "bar" }] } },
        { name: "showIcons", label: "Icons", type: "boolean", default: true, description: "Icons", remixer: { control: "checkbox", group: "items", groupTitle: "Items" } },
        { name: "showDescriptions", label: "Descriptions", type: "boolean", default: true, description: "Descriptions", remixer: { control: "checkbox", group: "items", groupTitle: "Items" } },
        { name: "rollingText", label: "Rolling text", type: "boolean", default: false, description: "Rolling text", remixer: { control: "checkbox", group: "items", groupTitle: "Items" } },
        { name: "size", label: "Size", type: "string", default: "lg", description: "Size", remixer: { control: "select", group: "style", groupTitle: "Style", options: [{ label: "sm", value: "sm" }, { label: "md", value: "md" }, { label: "lg", value: "lg" }] } },
        { name: "rounded", label: "Roundness", type: "string", default: "lg", description: "Roundness", remixer: { control: "select", group: "style", groupTitle: "Style", options: [{ label: "None", value: "none" }, { label: "sm", value: "sm" }, { label: "md", value: "md" }, { label: "lg", value: "lg" }, { label: "xl", value: "xl" }, { label: "2xl", value: "2xl" }] } },
      ]}
    >
      {({ values, effect }) => (
        <>
          <DemoHeader />
          <div
            {...getThemeProps(values.theme as AnimatedMenubarTheme, values.mode as AnimatedMenubarMode)}
            className="flex min-h-screen w-full flex-col items-center gap-[3vw] bg-(--hx-background) px-[5vw] py-[7%] text-(--hx-foreground) transition-colors duration-500 max-md:gap-[8vw] max-md:py-[25%]"
          >
            <div className="flex flex-col items-center gap-[1vw]">
              <HeadAnim>
                <h1 className="text-[4vw] max-md:text-[7vw] max-sm:text-[9vw]">Animated Menubar</h1>
              </HeadAnim>
              <SplitLine>
                <p className="text-center max-md:w-[80vw]">A row of menus, like an app’s File and Edit menus.</p>
              </SplitLine>
            </div>
            <div className="w-[60vw] max-md:w-full">{effect}</div>
          </div>
        </>
      )}
    </LocalRemixerDemo>
  );
}
