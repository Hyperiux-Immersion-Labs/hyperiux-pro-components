"use client";

import { useState } from "react";
import AnimatedThemeSwitch, { getThemeProps, type AnimatedThemeSwitchTheme, type AnimatedThemeSwitchMode } from "@/components/animated-theme-switch";
import HeadAnim from "@/components/Animations/HeadAnim";
import DemoHeader from "@/components/preview-chrome/DemoHeader";
import SplitLine from "@/components/WebsiteComps/SplitLine";
import LocalRemixerDemo from "@/components/local-remixer/LocalRemixerDemo";

export default function DemoContent() {
  // The switch owns the mode, so the whole page follows it and the reveal spreads over the page, not a box
  const [mode, setMode] = useState<AnimatedThemeSwitchMode>("light");

  return (
    <LocalRemixerDemo
      name="animated-theme-switch"
      category="components"
      render={(values) => (
        <AnimatedThemeSwitch {...values} mode={mode} onModeChange={setMode} />
      )}
      props={[
        { name: "theme", label: "Theme", type: "string", default: "spotify", description: "Colour palette. Any theme but Default also tints the sun and moon icon, except on the Default button, which is already primary.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Default", value: "default" }, { label: "Caffeine", value: "caffeine" }, { label: "Claude", value: "claude" }, { label: "Ghibli", value: "ghibli" }, { label: "Spotify", value: "spotify" }, { label: "Valorant", value: "valorant" }, { label: "Vscode", value: "vscode" }] } },
        { name: "revealAnimation", label: "Reveal animation", type: "string", default: "circle", description: "How the new theme spreads over the old one.", remixer: { control: "select", group: "transition", groupTitle: "Transition", options: [{ label: "Circle from button", value: "circle" }, { label: "Swipe", value: "swipe" }, { label: "Fade", value: "fade" }], hideWhenReducedMotion: true } },
        { name: "duration", label: "Duration", type: "number", default: 0.85, description: "How long the theme change takes, in seconds.", remixer: { control: "range", group: "transition", groupTitle: "Transition", min: 0.2, max: 2, step: 0.05, hideWhenReducedMotion: true } },
        { name: "iconAnimation", label: "Icon motion", type: "string", default: "orbit", description: "How the sun and moon icons swap.", remixer: { control: "select", group: "button", groupTitle: "Button", options: [{ label: "Spin", value: "spin" }, { label: "Orbit", value: "orbit" }], hideWhenReducedMotion: true } },
        { name: "showTooltip", label: "Tooltip", type: "boolean", default: true, description: "Shows a tooltip naming the theme the button switches to.", remixer: { control: "checkbox", group: "button", groupTitle: "Button" } },
        { name: "variant", label: "Look", type: "string", default: "outline", description: "Style of the button: outline, ghost (no border) or filled.", remixer: { control: "select", group: "button", groupTitle: "Button", options: [{ label: "Outline", value: "outline" }, { label: "Ghost", value: "ghost" }, { label: "Default", value: "default" }, { label: "Secondary", value: "secondary" }] } },
      ]}
    >
      {({ values, effect }) => (
        <>
          <DemoHeader />
          <div
            {...getThemeProps(values.theme as AnimatedThemeSwitchTheme, mode)}
            className="flex min-h-screen w-full flex-col items-center gap-[3vw] bg-(--hx-background) px-[5vw] pt-[12%] text-(--hx-foreground) max-lg:gap-[6vw] max-lg:pt-[20%] max-md:gap-[8vw] max-md:pt-[35%]"
          >
            <div className="flex w-full flex-col items-center gap-[1vw] max-lg:gap-[2vw]">
              <HeadAnim>
                <h1 className="text-center text-[4vw] max-lg:text-[6vw] max-md:text-[7vw] max-sm:text-[9vw]">Animated Theme Switch</h1>
              </HeadAnim>
              <SplitLine>
                <p className="text-center max-lg:w-[80vw]">Switch between light and dark with a transition.</p>
              </SplitLine>
            </div>
            <div className="w-[60vw] max-lg:w-[85vw] max-md:w-full">{effect}</div>
          </div>
        </>
      )}
    </LocalRemixerDemo>
  );
}
