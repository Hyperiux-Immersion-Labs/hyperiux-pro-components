"use client";

import AnimatedForm, { getThemeProps, type AnimatedFormTheme, type AnimatedFormMode } from "@/components/animated-form-fields";
import HeadAnim from "@/components/Animations/HeadAnim";
import DemoHeader from "@/components/preview-chrome/DemoHeader";
import SplitLine from "@/components/WebsiteComps/SplitLine";
import LocalRemixerDemo from "@/components/local-remixer/LocalRemixerDemo";

export default function DemoContent() {
  return (
    <LocalRemixerDemo
      name="animated-form-fields"
      category="components"
      render={(values) => (
        <AnimatedForm {...values} className="p-[2vw] max-md:p-[5vw]" />
      )}
      props={[
        { name: "theme", label: "Theme", type: "string", default: "default", description: "Colour palette for every part, popups included.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Default", value: "default" }, { label: "Caffeine", value: "caffeine" }, { label: "Claude", value: "claude" }, { label: "Ghibli", value: "ghibli" }, { label: "Spotify", value: "spotify" }, { label: "Valorant", value: "valorant" }, { label: "Vscode", value: "vscode" }] } },
        { name: "mode", label: "Mode", type: "string", default: "light", description: "Light or dark version of the palette.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Light", value: "light" }, { label: "Dark", value: "dark" }] } },
        { name: "labelStyle", label: "Label", type: "string", default: "floating", description: "Label", remixer: { control: "select", group: "label", groupTitle: "Label", options: [{ label: "Floating", value: "floating" }, { label: "Inside, fades on typing", value: "inside" }, { label: "Above", value: "above" }] } },
        { name: "showSuccessTick", label: "Show success tick", type: "boolean", default: true, description: "Show success tick", remixer: { control: "checkbox", group: "input", groupTitle: "Input" } },
        { name: "showCounter", label: "Show counter", type: "boolean", default: true, description: "Show counter", remixer: { control: "checkbox", group: "input", groupTitle: "Input" } },
        { name: "showDescription", label: "Description", type: "boolean", default: false, description: "Description", remixer: { control: "checkbox", group: "input", groupTitle: "Input" } },
        { name: "rounded", label: "Roundness", type: "string", default: "lg", description: "Roundness", remixer: { control: "select", group: "input", groupTitle: "Input", options: [{ label: "None", value: "none" }, { label: "sm", value: "sm" }, { label: "md", value: "md" }, { label: "lg", value: "lg" }, { label: "xl", value: "xl" }, { label: "Full", value: "full" }] } },
        { name: "validate", label: "Check required fields", type: "boolean", default: false, description: "Check required fields", remixer: { control: "checkbox", group: "errors", groupTitle: "Errors" } },
        { name: "errorAnimation", label: "Error message entry", type: "string", default: "slide", description: "Error message entry", remixer: { control: "select", group: "errors", groupTitle: "Errors", options: [{ label: "Slide open", value: "slide" }, { label: "Fade", value: "fade" }, { label: "None", value: "none" }] } },
        { name: "shakeOnError", label: "Shake on error", type: "boolean", default: true, description: "Shake on error", remixer: { control: "checkbox", group: "errors", groupTitle: "Errors" } },
      ]}
    >
      {({ values, effect }) => (
        <>
          <DemoHeader />
          <div
            {...getThemeProps(values.theme as AnimatedFormTheme, values.mode as AnimatedFormMode)}
            className="flex min-h-screen w-full flex-col items-center gap-[3vw] bg-(--hx-background) px-[5vw] py-[7%] text-(--hx-foreground) transition-colors duration-500 max-md:gap-[8vw] max-md:py-[25%]"
          >
            <div className="flex flex-col items-center gap-[1vw]">
              <HeadAnim>
                <h1 className="text-[4vw] max-md:text-[7vw] max-sm:text-[9vw]">Animated Form Fields</h1>
              </HeadAnim>
              <SplitLine>
                <p className="text-center max-md:w-[80vw]">Labels, hints and errors that hold a form’s inputs together.</p>
              </SplitLine>
            </div>
            <div className="w-[60vw] max-md:w-full">{effect}</div>
          </div>
        </>
      )}
    </LocalRemixerDemo>
  );
}
