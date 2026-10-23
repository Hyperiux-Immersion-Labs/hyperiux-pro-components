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
        { name: "theme", label: "Theme", type: "string", default: "caffeine", description: "Colour palette. Any theme but Default also tints the questions, icon and hover line.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Default", value: "default" }, { label: "Caffeine", value: "caffeine" }, { label: "Claude", value: "claude" }, { label: "Ghibli", value: "ghibli" }, { label: "Spotify", value: "spotify" }, { label: "Valorant", value: "valorant" }, { label: "Vscode", value: "vscode" }] } },
        { name: "mode", label: "Mode", type: "string", default: "dark", description: "Light or dark version of the chosen palette.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Light", value: "light" }, { label: "Dark", value: "dark" }] } },
        { name: "multiple", label: "Multiple open", type: "boolean", default: false, description: "Lets more than one item stay open at a time. Off while Open on hover is on.", remixer: { control: "checkbox", group: "accordion", groupTitle: "Accordion", disabledWhen: { prop: "openOnHover", equals: true } } },
        { name: "openOnHover", label: "Open on hover", type: "boolean", default: false, description: "Opens an item when the pointer rests on it, and closes it on leave.", remixer: { control: "checkbox", group: "accordion", groupTitle: "Accordion" } },
        { name: "bordered", label: "Border", type: "boolean", default: false, description: "Draws a rounded border around the whole accordion.", remixer: { control: "checkbox", group: "accordion", groupTitle: "Accordion" } },
        { name: "borderRounded", label: "Border roundness", type: "string", default: "rounded-lg", description: "Corner radius of the outer border. Needs Border on.", remixer: { control: "select", group: "accordion", groupTitle: "Accordion", disabledWhen: { prop: "bordered", equals: false }, options: [{ label: "None", value: "rounded-none" }, { label: "Small", value: "rounded-sm" }, { label: "Medium", value: "rounded-md" }, { label: "Large", value: "rounded-lg" }, { label: "xl", value: "rounded-xl" }, { label: "2xl", value: "rounded-2xl" }, { label: "3xl", value: "rounded-3xl" }] } },
        { name: "elastic", label: "Elastic", type: "boolean", default: true, description: "Uses springs for opening, so panels and the fill overshoot slightly.", remixer: { control: "checkbox", hideWhenReducedMotion: true, group: "accordion", groupTitle: "Accordion" } },
        { name: "duration", label: "Duration", type: "number", default: 0.3, description: "How long opening and closing take, in seconds.", remixer: { control: "range", hideWhenReducedMotion: true, group: "timing", groupTitle: "Timing", min: 0.1, max: 1.5, step: 0.05 } },
        { name: "bounce", label: "Bounce", type: "number", default: 0.4, description: "How much the springs overshoot. Needs Elastic on.", remixer: { control: "range", hideWhenReducedMotion: true, group: "timing", groupTitle: "Timing", min: 0, max: 0.8, step: 0.05, disabledWhen: { prop: "elastic", equals: false } } },
        { name: "delay", label: "Delay", type: "number", default: 0.2, description: "Wait before the answer's paragraphs start fading in, in seconds.", remixer: { control: "range", hideWhenReducedMotion: true, group: "timing", groupTitle: "Timing", min: 0, max: 1, step: 0.05 } },
        { name: "stagger", label: "Stagger", type: "number", default: 0.05, description: "Gap between each paragraph's fade-in, in seconds.", remixer: { control: "range", hideWhenReducedMotion: true, group: "timing", groupTitle: "Timing", min: 0, max: 0.3, step: 0.01 } },
        { name: "fill", label: "Fill", type: "boolean", default: true, description: "Fills an open item's background with a colour.", remixer: { control: "checkbox", group: "item", groupTitle: "Item" } },
        { name: "fillColor", label: "Fill colour", type: "string", default: "primary", description: "Background colour of an open item. Needs Fill on.", remixer: { control: "select", group: "item", groupTitle: "Item", disabledWhen: { prop: "fill", equals: false }, options: [{ label: "Muted", value: "muted" }, { label: "Primary", value: "primary" }] } },
        { name: "rounded", label: "Fill roundness", type: "string", default: "rounded-none", description: "Corner radius of an open item's fill. Needs Fill on.", remixer: { control: "select", group: "item", groupTitle: "Item", disabledWhen: { prop: "fill", equals: false }, options: [{ label: "None", value: "rounded-none" }, { label: "Small", value: "rounded-sm" }, { label: "Medium", value: "rounded-md" }, { label: "Large", value: "rounded-lg" }, { label: "xl", value: "rounded-xl" }, { label: "2xl", value: "rounded-2xl" }, { label: "3xl", value: "rounded-3xl" }] } },
        { name: "showLine", label: "Hover line", type: "boolean", default: true, description: "Draws a line under an item on hover and while it's open.", remixer: { control: "checkbox", group: "item", groupTitle: "Item" } },
        { name: "icon", label: "Icon", type: "string", default: "plus", description: "Plus that turns into a minus, or a chevron that flips.", remixer: { control: "select", group: "icon", groupTitle: "Icon", options: [{ label: "Plus / minus", value: "plus" }, { label: "Chevron", value: "chevron" }] } },
      ]}
    >
      {({ values, effect }) => (
        <>
          <DemoHeader />
          <div
            {...getThemeProps(values.theme as AnimatedAccordionTheme, values.mode as AnimatedAccordionMode)}
            className="flex min-h-screen w-full flex-col items-center gap-[3vw] bg-(--hx-background) px-[5vw] pt-[7%] text-(--hx-foreground) transition-colors duration-500 max-md:gap-[8vw] max-md:pt-[25%]"
          >
            <div className="flex flex-col items-center gap-[1vw]">
              <HeadAnim>
                <h1 className="text-center text-[4vw] max-md:text-[7vw] max-sm:text-[9vw]">Animated Accordion</h1>
              </HeadAnim>
              <SplitLine>
                <p className="text-center max-md:w-[80vw]">Expandable sections that reveal their answers with a staggered fade.</p>
              </SplitLine>
            </div>
            <div className="w-[60vw] max-lg:w-[85vw] max-md:w-full">{effect}</div>
          </div>
        </>
      )}
    </LocalRemixerDemo>
  );
}
