"use client";

import AnimatedButtonSet, { getThemeProps, type AnimatedButtonSetTheme, type AnimatedButtonSetMode } from "@/components/animated-button";
import HeadAnim from "@/components/Animations/HeadAnim";
import DemoHeader from "@/components/preview-chrome/DemoHeader";
import SplitLine from "@/components/WebsiteComps/SplitLine";
import LocalRemixerDemo from "@/components/local-remixer/LocalRemixerDemo";

export default function DemoContent() {
  return (
    <LocalRemixerDemo
      name="animated-button"
      category="components"
      render={(values) => (
        <AnimatedButtonSet {...values} className="p-[2vw] max-md:p-[5vw]" />
      )}
      props={[
        { name: "theme", label: "Theme", type: "string", default: "default", description: "Colour palette for every part, popups included.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Default", value: "default" }, { label: "Caffeine", value: "caffeine" }, { label: "Claude", value: "claude" }, { label: "Ghibli", value: "ghibli" }, { label: "Spotify", value: "spotify" }, { label: "Valorant", value: "valorant" }, { label: "Vscode", value: "vscode" }] } },
        { name: "mode", label: "Mode", type: "string", default: "light", description: "Light or dark version of the palette.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Light", value: "light" }, { label: "Dark", value: "dark" }] } },
        { name: "variant", label: "Hover effect", type: "string", default: "dot-fill", description: "Hover effect", remixer: { control: "select", group: "effect", groupTitle: "Effect", options: [{ label: "Dot fill", value: "dot-fill" }, { label: "Char stagger", value: "char-stagger" }, { label: "Scramble", value: "scramble" }, { label: "Link (line draw)", value: "link" }, { label: "Border draw", value: "border-draw" }] } },
        { name: "surface", label: "Background", type: "string", default: "filled", description: "Background", remixer: { control: "select", group: "effect", groupTitle: "Effect", options: [{ label: "Filled", value: "filled" }, { label: "Outline", value: "outline" }, { label: "Plain", value: "plain" }] } },
        { name: "tone", label: "Colour", type: "string", default: "primary", description: "Colour", remixer: { control: "select", group: "effect", groupTitle: "Effect", options: [{ label: "Primary", value: "primary" }, { label: "Muted", value: "muted" }, { label: "Destructive", value: "destructive" }, { label: "Success", value: "success" }, { label: "Warning", value: "warning" }, { label: "Info", value: "info" }, { label: "Gradient", value: "gradient" }] } },
        { name: "underline", label: "Line under text (plain)", type: "boolean", default: true, description: "Line under text (plain)", remixer: { control: "checkbox", group: "effect", groupTitle: "Effect" } },
        { name: "rollingText", label: "Rolling text", type: "boolean", default: true, description: "Rolling text", remixer: { control: "checkbox", group: "effect", groupTitle: "Effect" } },
        { name: "shimmerText", label: "Shimmer text", type: "boolean", default: false, description: "Shimmer text", remixer: { control: "checkbox", group: "effect", groupTitle: "Effect" } },
        { name: "pressFeedback", label: "Press feedback", type: "boolean", default: true, description: "Press feedback", remixer: { control: "checkbox", group: "effect", groupTitle: "Effect" } },
        { name: "magnetic", label: "Magnetic", type: "boolean", default: false, description: "Magnetic", remixer: { control: "checkbox", group: "effect", groupTitle: "Effect" } },
        { name: "showLoadingState", label: "Show loading state", type: "boolean", default: false, description: "Show loading state", remixer: { control: "checkbox", group: "state", groupTitle: "State" } },
        { name: "icon", label: "Icon", type: "string", default: "arrow", description: "Icon", remixer: { control: "select", group: "icon", groupTitle: "Icon", options: [{ label: "None", value: "none" }, { label: "Arrow", value: "arrow" }, { label: "Search", value: "search" }, { label: "Settings", value: "settings" }] } },
        { name: "iconPosition", label: "Icon position", type: "string", default: "end", description: "Icon position", remixer: { control: "select", group: "icon", groupTitle: "Icon", options: [{ label: "End", value: "end" }, { label: "Start", value: "start" }] } },
        { name: "rounded", label: "Roundness", type: "string", default: "full", description: "Roundness", remixer: { control: "select", group: "style", groupTitle: "Style", options: [{ label: "None", value: "none" }, { label: "sm", value: "sm" }, { label: "md", value: "md" }, { label: "lg", value: "lg" }, { label: "xl", value: "xl" }, { label: "2xl", value: "2xl" }, { label: "Full", value: "full" }] } },
        { name: "duration", label: "Duration", type: "number", default: 0.55, description: "Duration", remixer: { control: "range", group: "motion", groupTitle: "Motion", min: 0.2, max: 1.2, step: 0.05 } },
        { name: "stagger", label: "Stagger", type: "number", default: 0.02, description: "Stagger", remixer: { control: "range", group: "motion", groupTitle: "Motion", min: 0, max: 0.08, step: 0.005 } },
      ]}
    >
      {({ values, effect }) => (
        <>
          <DemoHeader />
          <div
            {...getThemeProps(values.theme as AnimatedButtonSetTheme, values.mode as AnimatedButtonSetMode)}
            className="flex min-h-screen w-full flex-col items-center gap-[3vw] bg-(--hx-background) px-[5vw] py-[7%] text-(--hx-foreground) transition-colors duration-500 max-md:gap-[8vw] max-md:py-[25%]"
          >
            <div className="flex flex-col items-center gap-[1vw]">
              <HeadAnim>
                <h1 className="text-[4vw] max-md:text-[7vw] max-sm:text-[9vw]">Animated Button</h1>
              </HeadAnim>
              <SplitLine>
                <p className="text-center max-md:w-[80vw]">Buttons with hover, press and loading animations.</p>
              </SplitLine>
            </div>
            <div className="w-[60vw] max-md:w-full">{effect}</div>
          </div>
        </>
      )}
    </LocalRemixerDemo>
  );
}
