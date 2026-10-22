"use client";

import AnimatedSwitch, { getThemeProps, type AnimatedSwitchTheme, type AnimatedSwitchMode } from "@/components/animated-switch";
import HeadAnim from "@/components/Animations/HeadAnim";
import DemoHeader from "@/components/preview-chrome/DemoHeader";
import SplitLine from "@/components/WebsiteComps/SplitLine";
import LocalRemixerDemo from "@/components/local-remixer/LocalRemixerDemo";

export default function DemoContent() {
  return (
    <LocalRemixerDemo
      name="animated-switch"
      category="components"
      render={(values) => (
        <AnimatedSwitch {...values} className="p-[2vw] max-md:p-[5vw]" />
      )}
      props={[
        { name: "theme", label: "Theme", type: "string", default: "valorant", description: "Colour palette for the track, thumb, marks and focus ring. Primary uses its primary colour; Green, Blue, Orange and Rose use its success, info, warning and destructive colours.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Default", value: "default" }, { label: "Caffeine", value: "caffeine" }, { label: "Claude", value: "claude" }, { label: "Ghibli", value: "ghibli" }, { label: "Spotify", value: "spotify" }, { label: "Valorant", value: "valorant" }, { label: "Vscode", value: "vscode" }] } },
        { name: "mode", label: "Mode", type: "string", default: "dark", description: "Light or dark version of the palette. Starts dark.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Light", value: "light" }, { label: "Dark", value: "dark" }] } },
        { name: "variant", label: "Switch type", type: "string", default: "elastic", description: "Elastic stretches the thumb as it moves; Apple copies the iOS switch.", remixer: { control: "select", group: "style", groupTitle: "Style", options: [{ label: "Elastic", value: "elastic" }, { label: "Apple", value: "apple" }] } },
        { name: "size", label: "Size", type: "string", default: "xl", description: "Size of the switch.", remixer: { control: "select", group: "style", groupTitle: "Style", options: [{ label: "md", value: "md" }, { label: "lg", value: "lg" }, { label: "xl", value: "xl" }] } },
        { name: "color", label: "On colour", type: "string", default: "primary", description: "Track colour when the switch is on.", remixer: { control: "select", group: "style", groupTitle: "Style", options: [{ label: "Primary", value: "primary" }, { label: "Foreground", value: "foreground" }, { label: "Green", value: "green" }, { label: "Blue", value: "blue" }, { label: "Orange", value: "orange" }, { label: "Rose", value: "rose" }] } },
        { name: "appleGreen", label: "Apple green", type: "boolean", default: false, description: "Uses iOS green for the on track. Only for the Apple type with On colour set to Foreground.", remixer: { control: "checkbox", group: "style", groupTitle: "Style", disabledWhen: [ { "prop": "variant", "notEquals": "apple" }, { "prop": "color", "notEquals": "foreground" } ] } },
        { name: "rounded", label: "Roundness", type: "string", default: "full", description: "Corner radius of the track and thumb.", remixer: { control: "select", group: "style", groupTitle: "Style", options: [{ label: "sm", value: "sm" }, { label: "md", value: "md" }, { label: "lg", value: "lg" }, { label: "xl", value: "xl" }, { label: "Full", value: "full" }] } },
        { name: "showMarks", label: "Show marks", type: "boolean", default: false, description: "Shows on and off marks inside the track.", remixer: { control: "checkbox", group: "style", groupTitle: "Style" } },
        { name: "labelPosition", label: "Label position", type: "string", default: "top", description: "Where the label sits relative to the switch.", remixer: { control: "select", group: "style", groupTitle: "Style", options: [{ label: "Above", value: "top" }, { label: "Below", value: "bottom" }, { label: "Left", value: "left" }, { label: "Right", value: "right" }] } },
        { name: "pressSqueeze", label: "Press squeeze", type: "number", default: 0.24, description: "How much the thumb squashes when pressed (Elastic) or widens (Apple, which stops changing above about 0.27).", remixer: { control: "range", group: "motion", groupTitle: "Motion", min: 0, max: 0.4, step: 0.01, hideWhenReducedMotion: true } },
        { name: "duration", label: "Duration", type: "number", default: 0.35, description: "How long the thumb takes to move, in seconds.", remixer: { control: "range", group: "motion", groupTitle: "Motion", min: 0.1, max: 1, step: 0.05, hideWhenReducedMotion: true } },
        { name: "bounce", label: "Bounce", type: "number", default: 0.3, description: "Springiness of the thumb when it lands. 0 means no overshoot.", remixer: { control: "range", group: "motion", groupTitle: "Motion", min: 0, max: 0.7, step: 0.05, hideWhenReducedMotion: true } },
      ]}
    >
      {({ values, effect }) => (
        <>
          <DemoHeader />
          <div
            {...getThemeProps(values.theme as AnimatedSwitchTheme, values.mode as AnimatedSwitchMode)}
            className="flex min-h-screen w-full flex-col items-center gap-[3vw] bg-(--hx-background) px-[5vw] py-[7%] text-(--hx-foreground) transition-colors duration-500 max-md:gap-[8vw] max-md:py-[25%]"
          >
            <div className="flex flex-col items-center gap-[1vw]">
              <HeadAnim>
                <h1 className="text-[4vw] max-md:text-[7vw] max-sm:text-[9vw]">Animated Switch</h1>
              </HeadAnim>
              <SplitLine>
                <p className="text-center max-md:w-[80vw]">A toggle between on and off.</p>
              </SplitLine>
            </div>
            <div className="w-[60vw] max-lg:w-[85vw] max-md:w-full">{effect}</div>
          </div>
        </>
      )}
    </LocalRemixerDemo>
  );
}
