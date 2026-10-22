"use client";

import AnimatedRadioGroup, { getThemeProps, type RadioMode, type RadioTheme } from "@/components/animated-radio-group";
import HeadAnim from "@/components/Animations/HeadAnim";
import DemoHeader from "@/components/preview-chrome/DemoHeader";
import SplitLine from "@/components/WebsiteComps/SplitLine";
import LocalRemixerDemo from "@/components/local-remixer/LocalRemixerDemo";

export default function DemoContent() {
  return (
    <LocalRemixerDemo
      name="animated-radio-group"
      category="components"
      component={AnimatedRadioGroup}
      props={[
        { name: "theme", label: "Theme", type: "string", default: "default", description: "Colour palette for every part.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Default", value: "default" }, { label: "Caffeine", value: "caffeine" }, { label: "Claude", value: "claude" }, { label: "Ghibli", value: "ghibli" }, { label: "Spotify", value: "spotify" }, { label: "Valorant", value: "valorant" }, { label: "Vscode", value: "vscode" }] } },
        { name: "mode", label: "Mode", type: "string", default: "light", description: "Light or dark version of the palette.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Light", value: "light" }, { label: "Dark", value: "dark" }] } },
        { name: "variant", label: "Style", type: "string", default: "default", description: "Inline radios or bordered cards.", remixer: { control: "select", group: "style", groupTitle: "Style", options: [{ label: "Inline", value: "default" }, { label: "Cards", value: "card" }] } },
        { name: "cardFillColor", label: "Card fill color", type: "string", default: "muted", description: "Fill of the selected card: muted tint or solid accent.", remixer: { control: "select", group: "style", groupTitle: "Style", options: [{ label: "Muted", value: "muted" }, { label: "Accent", value: "accent" }] } },
        { name: "showIcon", label: "Icon", type: "boolean", default: true, description: "Show the radio circle next to each label.", remixer: { control: "checkbox", group: "style", groupTitle: "Style" } },
        { name: "showDescription", label: "Description", type: "boolean", default: true, description: "Show each option's description line.", remixer: { control: "checkbox", group: "style", groupTitle: "Style" } },
        { name: "slideDot", label: "Slide dot", type: "boolean", default: false, description: "Dot glides from the old choice to the new one.", remixer: { control: "checkbox", group: "choosing", groupTitle: "Choosing" } },
        { name: "slideCard", label: "Slide card", type: "boolean", default: true, description: "Card highlight glides between cards.", remixer: { control: "checkbox", group: "choosing", groupTitle: "Choosing" } },
        { name: "elastic", label: "Elastic", type: "boolean", default: true, description: "Springy squash when an option is picked.", remixer: { control: "checkbox", group: "choosing", groupTitle: "Choosing" } },
        { name: "appearance", label: "Look", type: "string", default: "outline", description: "Radio look: outline ring, filled ring or one solid circle.", remixer: { control: "select", group: "radio", groupTitle: "Radio", options: [{ label: "Outline", value: "outline" }, { label: "Filled", value: "filled" }, { label: "Full", value: "full" }] } },
        { name: "reorder", label: "Drag to reorder", type: "boolean", default: false, description: "Drag options up and down to reorder them.", remixer: { control: "checkbox", group: "group", groupTitle: "Group" } },
        { name: "colorful", label: "Colour per option", type: "boolean", default: false, description: "Use each option's own accent colour.", remixer: { control: "checkbox", group: "group", groupTitle: "Group" } },
      ]}
    >
      {({ values, effect }) => (
        <>
          <DemoHeader />
          <div
            {...getThemeProps(values.theme as RadioTheme, values.mode as RadioMode)}
            className="flex min-h-screen w-full flex-col items-center gap-[3vw] bg-(--hx-background) px-[5vw] py-[7%] text-(--hx-foreground) transition-colors duration-500 max-md:gap-[8vw] max-md:py-[25%]"
          >
            <div className="flex flex-col items-center gap-[1vw]">
              <HeadAnim>
                <h1 className="text-[4vw] max-md:text-[7vw] max-sm:text-[9vw]">Animated Radio Group</h1>
              </HeadAnim>
              <SplitLine>
                <p className="text-center max-md:w-[80vw]">Pick one option. Arrow keys, Home and End move the choice.</p>
              </SplitLine>
            </div>
            <div className="w-[40vw] max-md:w-full">{effect}</div>
          </div>
        </>
      )}
    </LocalRemixerDemo>
  );
}
