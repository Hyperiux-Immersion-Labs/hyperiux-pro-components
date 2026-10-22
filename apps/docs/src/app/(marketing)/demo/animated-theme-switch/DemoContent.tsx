"use client";

import AnimatedThemeSwitch, { getThemeProps, type AnimatedThemeSwitchTheme, type AnimatedThemeSwitchMode } from "@/components/animated-theme-switch";
import HeadAnim from "@/components/Animations/HeadAnim";
import DemoHeader from "@/components/preview-chrome/DemoHeader";
import SplitLine from "@/components/WebsiteComps/SplitLine";
import LocalRemixerDemo from "@/components/local-remixer/LocalRemixerDemo";

export default function DemoContent() {
  return (
    <LocalRemixerDemo
      name="animated-theme-switch"
      category="components"
      render={(values) => (
        <AnimatedThemeSwitch {...values} className="flex min-h-[40vh] items-center justify-center rounded-2xl bg-(--hx-background) p-[3vw] transition-colors duration-500" />
      )}
      props={[
        { name: "theme", label: "Theme", type: "string", default: "default", description: "Colour palette for every part, popups included.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Default", value: "default" }, { label: "Caffeine", value: "caffeine" }, { label: "Claude", value: "claude" }, { label: "Ghibli", value: "ghibli" }, { label: "Spotify", value: "spotify" }, { label: "Valorant", value: "valorant" }, { label: "Vscode", value: "vscode" }] } },
        { name: "mode", label: "Mode", type: "string", default: "light", description: "Light or dark version of the palette.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Light", value: "light" }, { label: "Dark", value: "dark" }] } },
        { name: "revealAnimation", label: "Reveal animation", type: "string", default: "circle", description: "Reveal animation", remixer: { control: "select", group: "transition", groupTitle: "Transition", options: [{ label: "Circle from button", value: "circle" }, { label: "Swipe", value: "swipe" }, { label: "Fade", value: "fade" }] } },
        { name: "duration", label: "Duration", type: "number", default: 0.7, description: "Duration", remixer: { control: "range", group: "transition", groupTitle: "Transition", min: 0.2, max: 2, step: 0.05 } },
        { name: "iconAnimation", label: "Icon motion", type: "string", default: "spin", description: "Icon motion", remixer: { control: "select", group: "button", groupTitle: "Button", options: [{ label: "Spin", value: "spin" }, { label: "Orbit", value: "orbit" }] } },
        { name: "showTooltip", label: "Tooltip", type: "boolean", default: true, description: "Tooltip", remixer: { control: "checkbox", group: "button", groupTitle: "Button" } },
        { name: "variant", label: "Look", type: "string", default: "outline", description: "Look", remixer: { control: "select", group: "button", groupTitle: "Button", options: [{ label: "Outline", value: "outline" }, { label: "Ghost", value: "ghost" }, { label: "Default", value: "default" }, { label: "Secondary", value: "secondary" }] } },
      ]}
    >
      {({ values, effect }) => (
        <>
          <DemoHeader />
          <div
            {...getThemeProps(values.theme as AnimatedThemeSwitchTheme, values.mode as AnimatedThemeSwitchMode)}
            className="flex min-h-screen w-full flex-col items-center gap-[3vw] bg-(--hx-background) px-[5vw] py-[7%] text-(--hx-foreground) transition-colors duration-500 max-md:gap-[8vw] max-md:py-[25%]"
          >
            <div className="flex flex-col items-center gap-[1vw]">
              <HeadAnim>
                <h1 className="text-[4vw] max-md:text-[7vw] max-sm:text-[9vw]">Animated Theme Switch</h1>
              </HeadAnim>
              <SplitLine>
                <p className="text-center max-md:w-[80vw]">Switch between light and dark with a transition.</p>
              </SplitLine>
            </div>
            <div className="w-[60vw] max-md:w-full">{effect}</div>
          </div>
        </>
      )}
    </LocalRemixerDemo>
  );
}
