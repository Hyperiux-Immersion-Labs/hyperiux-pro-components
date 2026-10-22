"use client";

import AnimatedToast, { getThemeProps, type AnimatedToastTheme, type AnimatedToastMode } from "@/components/animated-toast";
import HeadAnim from "@/components/Animations/HeadAnim";
import DemoHeader from "@/components/preview-chrome/DemoHeader";
import SplitLine from "@/components/WebsiteComps/SplitLine";
import LocalRemixerDemo from "@/components/local-remixer/LocalRemixerDemo";

export default function DemoContent() {
  return (
    <LocalRemixerDemo
      name="animated-toast"
      category="components"
      render={(values) => (
        <AnimatedToast {...values} className="p-[2vw] max-md:p-[5vw]" />
      )}
      props={[
        { name: "theme", label: "Theme", type: "string", default: "default", description: "Colour palette for every part, popups included.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Default", value: "default" }, { label: "Caffeine", value: "caffeine" }, { label: "Claude", value: "claude" }, { label: "Ghibli", value: "ghibli" }, { label: "Spotify", value: "spotify" }, { label: "Valorant", value: "valorant" }, { label: "Vscode", value: "vscode" }] } },
        { name: "mode", label: "Mode", type: "string", default: "light", description: "Light or dark version of the palette.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Light", value: "light" }, { label: "Dark", value: "dark" }] } },
        { name: "variant", label: "Variant", type: "string", default: "default", description: "Variant", remixer: { control: "select", group: "toast", groupTitle: "Toast", options: [{ label: "Default", value: "default" }, { label: "Success", value: "success" }, { label: "Info", value: "info" }, { label: "Warning", value: "warning" }, { label: "Error", value: "error" }, { label: "Loading → success", value: "loading" }] } },
        { name: "showDescription", label: "Description", type: "boolean", default: true, description: "Description", remixer: { control: "checkbox", group: "toast", groupTitle: "Toast" } },
        { name: "collapsibleDescription", label: "Collapsible description", type: "boolean", default: true, description: "Collapsible description", remixer: { control: "checkbox", group: "toast", groupTitle: "Toast" } },
        { name: "showAction", label: "Show action", type: "boolean", default: false, description: "Show action", remixer: { control: "checkbox", group: "toast", groupTitle: "Toast" } },
        { name: "timeout", label: "Stays for", type: "number", default: 5, description: "Stays for", remixer: { control: "range", group: "behaviour", groupTitle: "Behaviour", min: 1, max: 15, step: 1 } },
        { name: "elastic", label: "Elastic", type: "boolean", default: true, description: "Elastic", remixer: { control: "checkbox", group: "animation", groupTitle: "Animation" } },
        { name: "originFromTrigger", label: "Origin from trigger", type: "boolean", default: false, description: "Origin from trigger", remixer: { control: "checkbox", group: "animation", groupTitle: "Animation" } },
        { name: "fadeContent", label: "Fade content", type: "boolean", default: true, description: "Fade content", remixer: { control: "checkbox", group: "animation", groupTitle: "Animation" } },
        { name: "exitAnimation", label: "Exit animation", type: "string", default: "fade", description: "Exit animation", remixer: { control: "select", group: "animation", groupTitle: "Animation", options: [{ label: "Fade out", value: "fade" }, { label: "Slide off", value: "slide" }] } },
        { name: "tiltOnSwipe", label: "Tilt on swipe", type: "boolean", default: true, description: "Tilt on swipe", remixer: { control: "checkbox", group: "animation", groupTitle: "Animation" } },
        { name: "morphIcon", label: "Loading → tick morph", type: "boolean", default: true, description: "Loading → tick morph", remixer: { control: "checkbox", group: "animation", groupTitle: "Animation" } },
        { name: "showTimerBar", label: "Show timer bar", type: "boolean", default: true, description: "Show timer bar", remixer: { control: "checkbox", group: "animation", groupTitle: "Animation" } },
        { name: "glass", label: "Glass", type: "boolean", default: true, description: "Glass", remixer: { control: "checkbox", group: "style", groupTitle: "Style" } },
        { name: "showAccentEdge", label: "Show accent edge", type: "boolean", default: true, description: "Show accent edge", remixer: { control: "checkbox", group: "style", groupTitle: "Style" } },
        { name: "rounded", label: "Roundness", type: "string", default: "md", description: "Roundness", remixer: { control: "select", group: "style", groupTitle: "Style", options: [{ label: "None", value: "none" }, { label: "Medium", value: "md" }, { label: "Large", value: "lg" }, { label: "xl", value: "xl" }, { label: "2xl", value: "2xl" }, { label: "3xl", value: "3xl" }, { label: "Full (pill)", value: "full" }] } },
        { name: "position", label: "Position", type: "string", default: "bottom-center", description: "Position", remixer: { control: "select", group: "style", groupTitle: "Style", options: [{ label: "Bottom right", value: "bottom-right" }, { label: "Bottom left", value: "bottom-left" }, { label: "Bottom centre", value: "bottom-center" }, { label: "Top right", value: "top-right" }, { label: "Top left", value: "top-left" }, { label: "Top centre", value: "top-center" }] } },
      ]}
    >
      {({ values, effect }) => (
        <>
          <DemoHeader />
          <div
            {...getThemeProps(values.theme as AnimatedToastTheme, values.mode as AnimatedToastMode)}
            className="flex min-h-screen w-full flex-col items-center gap-[3vw] bg-(--hx-background) px-[5vw] py-[7%] text-(--hx-foreground) transition-colors duration-500 max-md:gap-[8vw] max-md:py-[25%]"
          >
            <div className="flex flex-col items-center gap-[1vw]">
              <HeadAnim>
                <h1 className="text-[4vw] max-md:text-[7vw] max-sm:text-[9vw]">Animated Toast</h1>
              </HeadAnim>
              <SplitLine>
                <p className="text-center max-md:w-[80vw]">Brief messages that stack in the corner and can be swiped away.</p>
              </SplitLine>
            </div>
            <div className="w-[60vw] max-md:w-full">{effect}</div>
          </div>
        </>
      )}
    </LocalRemixerDemo>
  );
}
