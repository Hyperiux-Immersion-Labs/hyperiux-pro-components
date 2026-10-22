"use client";

import AnimatedSlider, { getThemeProps, type AnimatedSliderTheme, type AnimatedSliderMode } from "@/components/animated-slider";
import HeadAnim from "@/components/Animations/HeadAnim";
import DemoHeader from "@/components/preview-chrome/DemoHeader";
import SplitLine from "@/components/WebsiteComps/SplitLine";
import LocalRemixerDemo from "@/components/local-remixer/LocalRemixerDemo";

export default function DemoContent() {
  return (
    <LocalRemixerDemo
      name="animated-slider"
      category="components"
      render={(values) => (
        <AnimatedSlider {...values} className="p-[2vw] max-md:p-[5vw]" />
      )}
      props={[
        { name: "theme", label: "Theme", type: "string", default: "default", description: "Colour palette for every part, popups included.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Default", value: "default" }, { label: "Caffeine", value: "caffeine" }, { label: "Claude", value: "claude" }, { label: "Ghibli", value: "ghibli" }, { label: "Spotify", value: "spotify" }, { label: "Valorant", value: "valorant" }, { label: "Vscode", value: "vscode" }] } },
        { name: "mode", label: "Mode", type: "string", default: "light", description: "Light or dark version of the palette.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Light", value: "light" }, { label: "Dark", value: "dark" }] } },
        { name: "smooth", label: "Smooth (no snapping)", type: "boolean", default: false, description: "Smooth (no snapping)", remixer: { control: "checkbox", group: "track", groupTitle: "Track" } },
        { name: "duration", label: "Duration", type: "number", default: 0.4, description: "Duration", remixer: { control: "range", group: "track", groupTitle: "Track", min: 0.1, max: 1, step: 0.05 } },
        { name: "bounce", label: "Bounce", type: "number", default: 0, description: "Bounce", remixer: { control: "range", group: "track", groupTitle: "Track", min: 0, max: 0.6, step: 0.05 } },
        { name: "thickenOn", label: "Thicken on", type: "string", default: "hover", description: "Thicken on", remixer: { control: "select", group: "track", groupTitle: "Track", options: [{ label: "Hover", value: "hover" }, { label: "Drag", value: "drag" }, { label: "Never", value: "none" }] } },
        { name: "elastic", label: "Elastic", type: "boolean", default: true, description: "Elastic", remixer: { control: "checkbox", group: "track", groupTitle: "Track" } },
        { name: "stretchAmount", label: "Stretch amount", type: "number", default: 10, description: "Stretch amount", remixer: { control: "range", group: "track", groupTitle: "Track", min: 2, max: 30, step: 1 } },
        { name: "labels", label: "Values on rail", type: "string", default: "rail", description: "Values on rail", remixer: { control: "select", group: "track", groupTitle: "Track", options: [{ label: "Show", value: "rail" }, { label: "Hide", value: "none" }] } },
        { name: "thickenedSize", label: "Thickened size", type: "string", default: "13", description: "Thickened size", remixer: { control: "select", group: "track", groupTitle: "Track", options: [{ label: "0.5", value: "0.5" }, { label: "1", value: "1" }, { label: "1.5", value: "1.5" }, { label: "2.5", value: "2.5" }, { label: "4", value: "4" }, { label: "13", value: "13" }] } },
        { name: "rounded", label: "Roundness", type: "string", default: "xl", description: "Roundness", remixer: { control: "select", group: "track", groupTitle: "Track", options: [{ label: "None", value: "none" }, { label: "sm", value: "sm" }, { label: "md", value: "md" }, { label: "lg", value: "lg" }, { label: "xl", value: "xl" }, { label: "Full", value: "full" }] } },
        { name: "marks", label: "Step marks", type: "string", default: "none", description: "Step marks", remixer: { control: "select", group: "track", groupTitle: "Track", options: [{ label: "None", value: "none" }, { label: "Dots", value: "dots" }, { label: "Lines", value: "lines" }] } },
        { name: "showEdge", label: "Show edge", type: "boolean", default: true, description: "Show edge", remixer: { control: "checkbox", group: "edge", groupTitle: "Edge" } },
        { name: "edgePress", label: "While dragging", type: "string", default: "shrink", description: "While dragging", remixer: { control: "select", group: "edge", groupTitle: "Edge", options: [{ label: "Grows", value: "grow" }, { label: "Shrinks", value: "shrink" }, { label: "Stays put", value: "none" }] } },
        { name: "edgeVariant", label: "Style", type: "string", default: "bar", description: "Style", remixer: { control: "select", group: "edge", groupTitle: "Edge", options: [{ label: "Bar", value: "bar" }, { label: "Filled", value: "filled" }, { label: "Outline", value: "outline" }] } },
        { name: "bubble", label: "Value bubble", type: "string", default: "hover", description: "Value bubble", remixer: { control: "select", group: "edge", groupTitle: "Edge", options: [{ label: "Follows cursor", value: "hover" }, { label: "While dragging", value: "dragging" }, { label: "Always", value: "always" }, { label: "Never", value: "none" }] } },
        { name: "rollingNumbers", label: "Rolling numbers", type: "boolean", default: true, description: "Rolling numbers", remixer: { control: "checkbox", group: "edge", groupTitle: "Edge" } },
        { name: "edgeSize", label: "Edge size", type: "string", default: "md", description: "Edge size", remixer: { control: "select", group: "style", groupTitle: "Style", options: [{ label: "sm", value: "sm" }, { label: "md", value: "md" }, { label: "lg", value: "lg" }] } },
      ]}
    >
      {({ values, effect }) => (
        <>
          <DemoHeader />
          <div
            {...getThemeProps(values.theme as AnimatedSliderTheme, values.mode as AnimatedSliderMode)}
            className="flex min-h-screen w-full flex-col items-center gap-[3vw] bg-(--hx-background) px-[5vw] py-[7%] text-(--hx-foreground) transition-colors duration-500 max-md:gap-[8vw] max-md:py-[25%]"
          >
            <div className="flex flex-col items-center gap-[1vw]">
              <HeadAnim>
                <h1 className="text-[4vw] max-md:text-[7vw] max-sm:text-[9vw]">Animated Slider</h1>
              </HeadAnim>
              <SplitLine>
                <p className="text-center max-md:w-[80vw]">Drag a thumb to pick a value or a range.</p>
              </SplitLine>
            </div>
            <div className="w-[60vw] max-md:w-full">{effect}</div>
          </div>
        </>
      )}
    </LocalRemixerDemo>
  );
}
