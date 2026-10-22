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
        { name: "theme", label: "Theme", type: "string", default: "default", description: "Colour palette. The Primary colour option takes the theme's primary colour.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Default", value: "default" }, { label: "Caffeine", value: "caffeine" }, { label: "Claude", value: "claude" }, { label: "Ghibli", value: "ghibli" }, { label: "Spotify", value: "spotify" }, { label: "Valorant", value: "valorant" }, { label: "Vscode", value: "vscode" }] } },
        { name: "mode", label: "Mode", type: "string", default: "dark", description: "Light or dark version of the chosen palette.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Light", value: "light" }, { label: "Dark", value: "dark" }] } },
        { name: "variant", label: "Hover effect", type: "string", default: "dot-fill", description: "What happens on hover: a dot that fills, letters that stagger or scramble, a drawn underline, or a drawn border.", remixer: { control: "select", group: "effect", groupTitle: "Effect", options: [{ label: "Dot fill", value: "dot-fill" }, { label: "Char stagger", value: "char-stagger" }, { label: "Scramble", value: "scramble" }, { label: "Link (line draw)", value: "link" }, { label: "Border draw", value: "border-draw" }] } },
        { name: "surface", label: "Background", type: "string", default: "filled", description: "Filled or outlined background. Not used by Link; with Border draw both look the same.", remixer: { disabledWhen: { prop: "variant", equals: "link" }, control: "select", group: "effect", groupTitle: "Effect", options: [{ label: "Filled", value: "filled" }, { label: "Outline", value: "outline" }] } },
        { name: "tone", label: "Colour", type: "string", default: "primary", description: "Colour of the button: the theme's primary, a status colour, or a gradient.", remixer: { control: "select", group: "effect", groupTitle: "Effect", options: [{ label: "Primary", value: "primary" }, { label: "Muted", value: "muted" }, { label: "Destructive", value: "destructive" }, { label: "Success", value: "success" }, { label: "Warning", value: "warning" }, { label: "Info", value: "info" }, { label: "Gradient", value: "gradient" }] } },
        { name: "rollingText", label: "Rolling text", type: "boolean", default: true, description: "The label rolls up to a copy of itself on hover. Not used by Char stagger or Scramble.", remixer: { disabledWhen: { prop: "variant", in: ["char-stagger", "scramble"] }, control: "checkbox", group: "effect", groupTitle: "Effect" } },
        { name: "shimmerText", label: "Shimmer text", type: "boolean", default: false, description: "A light sweeps across the label. Not used by Char stagger or Scramble.", remixer: { disabledWhen: { prop: "variant", in: ["char-stagger", "scramble"] }, control: "checkbox", group: "effect", groupTitle: "Effect" } },
        { name: "pressFeedback", label: "Press feedback", type: "boolean", default: true, description: "The button presses in slightly when clicked.", remixer: { control: "checkbox", group: "effect", groupTitle: "Effect" } },
        { name: "magnetic", label: "Magnetic", type: "boolean", default: false, description: "The button leans towards the mouse as it gets close. Off on touch screens.", remixer: { control: "checkbox", group: "effect", groupTitle: "Effect" } },
        { name: "showLoadingState", label: "Show loading state", type: "boolean", default: true, description: "Clicking shows a loading spinner, then a check, then resets.", remixer: { control: "checkbox", group: "state", groupTitle: "State" } },
        { name: "icon", label: "Icon", type: "string", default: "arrow", description: "Icon shown beside the label, or none.", remixer: { control: "select", group: "icon", groupTitle: "Icon", options: [{ label: "None", value: "none" }, { label: "Arrow", value: "arrow" }, { label: "Search", value: "search" }, { label: "Settings", value: "settings" }] } },
        { name: "iconPosition", label: "Icon position", type: "string", default: "end", description: "Puts the icon before or after the label. Needs an icon.", remixer: { disabledWhen: { prop: "icon", equals: "none" }, control: "select", group: "icon", groupTitle: "Icon", options: [{ label: "End", value: "end" }, { label: "Start", value: "start" }] } },
        { name: "rounded", label: "Roundness", type: "string", default: "full", description: "Corner radius of the button. Not used by Link.", remixer: { disabledWhen: { prop: "variant", equals: "link" }, control: "select", group: "style", groupTitle: "Style", options: [{ label: "None", value: "none" }, { label: "sm", value: "sm" }, { label: "md", value: "md" }, { label: "lg", value: "lg" }, { label: "xl", value: "xl" }, { label: "2xl", value: "2xl" }, { label: "Full", value: "full" }] } },
        { name: "duration", label: "Duration", type: "number", default: 0.55, description: "How long the hover effect takes, in seconds.", remixer: { control: "range", group: "motion", groupTitle: "Motion", min: 0.2, max: 1.2, step: 0.05 } },
        { name: "stagger", label: "Stagger", type: "number", default: 0.02, description: "Gap between each letter's move, in seconds. Needs the Char stagger effect.", remixer: { disabledWhen: { prop: "variant", notEquals: "char-stagger" }, control: "range", group: "motion", groupTitle: "Motion", min: 0, max: 0.08, step: 0.005 } },
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
