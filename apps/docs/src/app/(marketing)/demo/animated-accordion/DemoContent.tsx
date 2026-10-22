"use client";

import AnimatedAccordion, { getThemeProps, type AnimatedAccordionTheme, type AnimatedAccordionMode } from "@/components/animated-accordion";
import HeadAnim from "@/components/Animations/HeadAnim";
import DemoHeader from "@/components/preview-chrome/DemoHeader";
import SplitLine from "@/components/WebsiteComps/SplitLine";
import LocalRemixerDemo from "@/components/local-remixer/LocalRemixerDemo";

export default function DemoContent() {
  return (
    <LocalRemixerDemo
      name="animated-accordion"
      category="components"
      render={(values) => (
        <AnimatedAccordion {...values} className="p-[2vw] max-md:p-[5vw]" />
      )}
      props={[
        { name: "theme", label: "Theme", type: "string", default: "default", description: "Colour palette for every part, popups included.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Default", value: "default" }, { label: "Caffeine", value: "caffeine" }, { label: "Claude", value: "claude" }, { label: "Ghibli", value: "ghibli" }, { label: "Spotify", value: "spotify" }, { label: "Valorant", value: "valorant" }, { label: "Vscode", value: "vscode" }] } },
        { name: "mode", label: "Mode", type: "string", default: "light", description: "Light or dark version of the palette.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Light", value: "light" }, { label: "Dark", value: "dark" }] } },
        { name: "multiple", label: "Multiple open", type: "boolean", default: false, description: "Multiple open", remixer: { control: "checkbox", group: "accordion", groupTitle: "Accordion" } },
        { name: "openOnHover", label: "Open on hover", type: "boolean", default: false, description: "Open on hover", remixer: { control: "checkbox", group: "accordion", groupTitle: "Accordion" } },
        { name: "bordered", label: "Border", type: "boolean", default: false, description: "Border", remixer: { control: "checkbox", group: "accordion", groupTitle: "Accordion" } },
        { name: "elastic", label: "Elastic", type: "boolean", default: false, description: "Elastic", remixer: { control: "checkbox", group: "accordion", groupTitle: "Accordion" } },
        { name: "duration", label: "Duration", type: "number", default: 0.5, description: "Duration", remixer: { control: "range", group: "timing", groupTitle: "Timing", min: 0.1, max: 1.5, step: 0.05 } },
        { name: "bounce", label: "Bounce", type: "number", default: 0.3, description: "Bounce", remixer: { control: "range", group: "timing", groupTitle: "Timing", min: 0, max: 0.8, step: 0.05 } },
        { name: "delay", label: "Delay", type: "number", default: 0.2, description: "Delay", remixer: { control: "range", group: "timing", groupTitle: "Timing", min: 0, max: 1, step: 0.05 } },
        { name: "stagger", label: "Stagger", type: "number", default: 0.05, description: "Stagger", remixer: { control: "range", group: "timing", groupTitle: "Timing", min: 0, max: 0.3, step: 0.01 } },
        { name: "fill", label: "Fill", type: "boolean", default: false, description: "Fill", remixer: { control: "checkbox", group: "item", groupTitle: "Item" } },
        { name: "fillColor", label: "Fill colour", type: "string", default: "muted", description: "Fill colour", remixer: { control: "select", group: "item", groupTitle: "Item", options: [{ label: "Muted", value: "muted" }, { label: "Primary", value: "primary" }] } },
        { name: "rounded", label: "Roundness", type: "string", default: "rounded-none", description: "Roundness", remixer: { control: "select", group: "item", groupTitle: "Item", options: [{ label: "None", value: "rounded-none" }, { label: "Small", value: "rounded-sm" }, { label: "Medium", value: "rounded-md" }, { label: "Large", value: "rounded-lg" }, { label: "xl", value: "rounded-xl" }, { label: "2xl", value: "rounded-2xl" }, { label: "3xl", value: "rounded-3xl" }] } },
        { name: "showLine", label: "Show line", type: "boolean", default: true, description: "Show line", remixer: { control: "checkbox", group: "item", groupTitle: "Item" } },
        { name: "icon", label: "Icon", type: "string", default: "plus", description: "Icon", remixer: { control: "select", group: "heading", groupTitle: "Heading", options: [{ label: "Plus / minus", value: "plus" }, { label: "Chevron", value: "chevron" }] } },
      ]}
    >
      {({ values, effect }) => (
        <>
          <DemoHeader />
          <div
            {...getThemeProps(values.theme as AnimatedAccordionTheme, values.mode as AnimatedAccordionMode)}
            className="flex min-h-screen w-full flex-col items-center gap-[3vw] bg-(--hx-background) px-[5vw] py-[7%] text-(--hx-foreground) transition-colors duration-500 max-md:gap-[8vw] max-md:py-[25%]"
          >
            <div className="flex flex-col items-center gap-[1vw]">
              <HeadAnim>
                <h1 className="text-[4vw] max-md:text-[7vw] max-sm:text-[9vw]">Animated Accordion</h1>
              </HeadAnim>
              <SplitLine>
                <p className="text-center max-md:w-[80vw]">Expandable sections that reveal their answers with a staggered fade.</p>
              </SplitLine>
            </div>
            <div className="w-[60vw] max-md:w-full">{effect}</div>
          </div>
        </>
      )}
    </LocalRemixerDemo>
  );
}
