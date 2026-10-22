"use client";

import AnimatedTooltip, { getThemeProps, type AnimatedTooltipTheme, type AnimatedTooltipMode } from "@/components/animated-tooltip";
import HeadAnim from "@/components/Animations/HeadAnim";
import DemoHeader from "@/components/preview-chrome/DemoHeader";
import SplitLine from "@/components/WebsiteComps/SplitLine";
import LocalRemixerDemo from "@/components/local-remixer/LocalRemixerDemo";

export default function DemoContent() {
  return (
    <LocalRemixerDemo
      name="animated-tooltip"
      category="components"
      render={(values) => (
        <AnimatedTooltip {...values} className="p-[2vw] max-md:p-[5vw]" />
      )}
      props={[
        { name: "theme", label: "Theme", type: "string", default: "default", description: "Colour palette for every part, popups included.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Default", value: "default" }, { label: "Caffeine", value: "caffeine" }, { label: "Claude", value: "claude" }, { label: "Ghibli", value: "ghibli" }, { label: "Spotify", value: "spotify" }, { label: "Valorant", value: "valorant" }, { label: "Vscode", value: "vscode" }] } },
        { name: "mode", label: "Mode", type: "string", default: "light", description: "Light or dark version of the palette.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Light", value: "light" }, { label: "Dark", value: "dark" }] } },
        { name: "variant", label: "Style", type: "string", default: "default", description: "Style", remixer: { control: "select", group: "look", groupTitle: "Look", options: [{ label: "Filled", value: "default" }, { label: "Outline", value: "outline" }] } },
        { name: "rounded", label: "Roundness", type: "string", default: "md", description: "Roundness", remixer: { control: "select", group: "look", groupTitle: "Look", options: [{ label: "None", value: "none" }, { label: "sm", value: "sm" }, { label: "md", value: "md" }, { label: "lg", value: "lg" }, { label: "xl", value: "xl" }, { label: "Full", value: "full" }] } },
        { name: "follow", label: "Position", type: "string", default: "cursor", description: "Position", remixer: { control: "select", group: "position", groupTitle: "Position", options: [{ label: "Trails the cursor", value: "cursor" }, { label: "Sits on the element", value: "anchor" }] } },
        { name: "side", label: "Side", type: "string", default: "top", description: "Side", remixer: { control: "select", group: "position", groupTitle: "Position", options: [{ label: "Top", value: "top" }, { label: "Bottom", value: "bottom" }, { label: "Left", value: "left" }, { label: "Right", value: "right" }] } },
        { name: "sideOffset", label: "Side offset", type: "string", default: "4", description: "Side offset", remixer: { control: "select", group: "position", groupTitle: "Position", options: [{ label: "1", value: "1" }, { label: "2", value: "2" }, { label: "3", value: "3" }, { label: "4", value: "4" }, { label: "6", value: "6" }, { label: "8", value: "8" }] } },
        { name: "changeAnimation", label: "Change animation", type: "string", default: "slide", description: "Change animation", remixer: { control: "select", group: "moving-between", groupTitle: "Moving between", options: [{ label: "Swap text", value: "instant" }, { label: "Morph and fade", value: "fade" }, { label: "Morph and slide", value: "slide" }, { label: "Morph and roll", value: "roll" }] } },
        { name: "duration", label: "Duration", type: "number", default: 0.35, description: "Duration", remixer: { control: "range", group: "moving-between", groupTitle: "Moving between", min: 0.1, max: 1, step: 0.05 } },
        { name: "elastic", label: "Elastic", type: "boolean", default: true, description: "Elastic", remixer: { control: "checkbox", group: "feel", groupTitle: "Feel" } },
        { name: "bounce", label: "Bounce", type: "number", default: 0.2, description: "Bounce", remixer: { control: "range", group: "feel", groupTitle: "Feel", min: 0, max: 0.6, step: 0.05 } },
        { name: "stretchOnMove", label: "Stretch on move", type: "boolean", default: true, description: "Stretch on move", remixer: { control: "checkbox", group: "feel", groupTitle: "Feel" } },
        { name: "tiltOnMove", label: "Tilt on move", type: "boolean", default: true, description: "Tilt on move", remixer: { control: "checkbox", group: "feel", groupTitle: "Feel" } },
        { name: "stiffness", label: "Follow speed", type: "number", default: 750, description: "Follow speed", remixer: { control: "range", group: "feel", groupTitle: "Feel", min: 100, max: 1500, step: 50 } },
        { name: "appearAnimation", label: "Appear animation", type: "string", default: "scale", description: "Appear animation", remixer: { control: "select", group: "show-and-hide", groupTitle: "Show and hide", options: [{ label: "Scale + fade", value: "scale" }, { label: "Fade", value: "fade" }, { label: "Nothing", value: "none" }] } },
        { name: "closeDelay", label: "Close delay", type: "number", default: 0.1, description: "Close delay", remixer: { control: "range", group: "show-and-hide", groupTitle: "Show and hide", min: 0, max: 0.6, step: 0.05 } },
      ]}
    >
      {({ values, effect }) => (
        <>
          <DemoHeader />
          <div
            {...getThemeProps(values.theme as AnimatedTooltipTheme, values.mode as AnimatedTooltipMode)}
            className="flex min-h-screen w-full flex-col items-center gap-[3vw] bg-(--hx-background) px-[5vw] py-[7%] text-(--hx-foreground) transition-colors duration-500 max-md:gap-[8vw] max-md:py-[25%]"
          >
            <div className="flex flex-col items-center gap-[1vw]">
              <HeadAnim>
                <h1 className="text-[4vw] max-md:text-[7vw] max-sm:text-[9vw]">Animated Tooltip</h1>
              </HeadAnim>
              <SplitLine>
                <p className="text-center max-md:w-[80vw]">A label that follows the pointer or appears on hover.</p>
              </SplitLine>
            </div>
            <div className="w-[60vw] max-md:w-full">{effect}</div>
          </div>
        </>
      )}
    </LocalRemixerDemo>
  );
}
