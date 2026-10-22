"use client";

import AnimatedDialog, { getThemeProps, type AnimatedDialogTheme, type AnimatedDialogMode } from "@/components/animated-dialog";
import HeadAnim from "@/components/Animations/HeadAnim";
import DemoHeader from "@/components/preview-chrome/DemoHeader";
import SplitLine from "@/components/WebsiteComps/SplitLine";
import LocalRemixerDemo from "@/components/local-remixer/LocalRemixerDemo";

export default function DemoContent() {
  return (
    <LocalRemixerDemo
      name="animated-dialog"
      category="components"
      render={(values) => (
        <AnimatedDialog {...values} className="p-[2vw] max-md:p-[5vw]" />
      )}
      props={[
        { name: "theme", label: "Theme", type: "string", default: "default", description: "Colour palette for every part, popups included.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Default", value: "default" }, { label: "Caffeine", value: "caffeine" }, { label: "Claude", value: "claude" }, { label: "Ghibli", value: "ghibli" }, { label: "Spotify", value: "spotify" }, { label: "Valorant", value: "valorant" }, { label: "Vscode", value: "vscode" }] } },
        { name: "mode", label: "Mode", type: "string", default: "light", description: "Light or dark version of the palette.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Light", value: "light" }, { label: "Dark", value: "dark" }] } },
        { name: "rollingText", label: "Rolling text", type: "boolean", default: true, description: "Rolling text", remixer: { control: "checkbox", group: "button", groupTitle: "Button" } },
        { name: "fillOnHover", label: "Fill on hover", type: "boolean", default: false, description: "Fill on hover", remixer: { control: "checkbox", group: "button", groupTitle: "Button" } },
        { name: "originFromTrigger", label: "Origin from trigger", type: "boolean", default: true, description: "Origin from trigger", remixer: { control: "checkbox", group: "opening", groupTitle: "Opening" } },
        { name: "elastic", label: "Elastic", type: "boolean", default: true, description: "Elastic", remixer: { control: "checkbox", group: "opening", groupTitle: "Opening" } },
        { name: "duration", label: "Duration", type: "number", default: 0.35, description: "Duration", remixer: { control: "range", group: "opening", groupTitle: "Opening", min: 0.1, max: 1, step: 0.05 } },
        { name: "bounce", label: "Bounce", type: "number", default: 0.2, description: "Bounce", remixer: { control: "range", group: "opening", groupTitle: "Opening", min: 0, max: 0.6, step: 0.05 } },
        { name: "fadeContent", label: "Fade content", type: "boolean", default: true, description: "Fade content", remixer: { control: "checkbox", group: "opening", groupTitle: "Opening" } },
        { name: "scaleContent", label: "Scale content", type: "boolean", default: false, description: "Scale content", remixer: { control: "checkbox", group: "opening", groupTitle: "Opening" } },
        { name: "exitAnimation", label: "Exit animation", type: "string", default: "fade", description: "Exit animation", remixer: { control: "select", group: "closing", groupTitle: "Closing", options: [{ label: "Fade", value: "fade" }, { label: "Drop", value: "drop" }, { label: "Shrink", value: "shrink" }] } },
        { name: "fadeContentOut", label: "Fade content out", type: "boolean", default: true, description: "Fade content out", remixer: { control: "checkbox", group: "closing", groupTitle: "Closing" } },
        { name: "dismissible", label: "Click outside closes", type: "boolean", default: true, description: "Click outside closes", remixer: { control: "checkbox", group: "closing", groupTitle: "Closing" } },
        { name: "shakeOnBlock", label: "Shake when blocked", type: "boolean", default: true, description: "Shake when blocked", remixer: { control: "checkbox", group: "closing", groupTitle: "Closing" } },
        { name: "backdrop", label: "Backdrop", type: "string", default: "blur", description: "Backdrop", remixer: { control: "select", group: "style", groupTitle: "Style", options: [{ label: "None", value: "none" }, { label: "Dim", value: "dim" }, { label: "Blur", value: "blur" }] } },
        { name: "rounded", label: "Roundness", type: "string", default: "xl", description: "Roundness", remixer: { control: "select", group: "style", groupTitle: "Style", options: [{ label: "None", value: "none" }, { label: "sm", value: "sm" }, { label: "md", value: "md" }, { label: "lg", value: "lg" }, { label: "xl", value: "xl" }, { label: "2xl", value: "2xl" }, { label: "3xl", value: "3xl" }] } },
      ]}
    >
      {({ values, effect }) => (
        <>
          <DemoHeader />
          <div
            {...getThemeProps(values.theme as AnimatedDialogTheme, values.mode as AnimatedDialogMode)}
            className="flex min-h-screen w-full flex-col items-center gap-[3vw] bg-(--hx-background) px-[5vw] py-[7%] text-(--hx-foreground) transition-colors duration-500 max-md:gap-[8vw] max-md:py-[25%]"
          >
            <div className="flex flex-col items-center gap-[1vw]">
              <HeadAnim>
                <h1 className="text-[4vw] max-md:text-[7vw] max-sm:text-[9vw]">Animated Dialog</h1>
              </HeadAnim>
              <SplitLine>
                <p className="text-center max-md:w-[80vw]">A window over the page that asks for a decision before you carry on.</p>
              </SplitLine>
            </div>
            <div className="w-[60vw] max-md:w-full">{effect}</div>
          </div>
        </>
      )}
    </LocalRemixerDemo>
  );
}
