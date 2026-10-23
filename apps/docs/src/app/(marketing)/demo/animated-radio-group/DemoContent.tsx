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
        { name: "theme", label: "Theme", type: "string", default: "valorant", description: "Colour palette. The selected radio and its dot take its primary colour; the selected card too when Card fill color is Accent.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Default", value: "default" }, { label: "Caffeine", value: "caffeine" }, { label: "Claude", value: "claude" }, { label: "Ghibli", value: "ghibli" }, { label: "Spotify", value: "spotify" }, { label: "Valorant", value: "valorant" }, { label: "Vscode", value: "vscode" }] } },
        { name: "mode", label: "Mode", type: "string", default: "dark", description: "Light or dark version of the palette. Starts dark.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Light", value: "light" }, { label: "Dark", value: "dark" }] } },
        { name: "variant", label: "Style", type: "string", default: "card", description: "Inline radios or bordered cards.", remixer: { control: "select", group: "style", groupTitle: "Style", options: [{ label: "Inline", value: "default" }, { label: "Cards", value: "card" }] } },
        { name: "cardFillColor", label: "Card fill color", type: "string", default: "accent", description: "Fill of the selected card: a muted tint or the solid accent. Needs Style set to Cards.", remixer: { control: "select", group: "style", groupTitle: "Style", options: [{ label: "Muted", value: "muted" }, { label: "Accent", value: "accent" }], disabledWhen: { prop: "variant", equals: "default" } } },
        { name: "showIcon", label: "Icon", type: "boolean", default: true, description: "Show the radio circle next to each label.", remixer: { control: "checkbox", group: "style", groupTitle: "Style" } },
        { name: "showDescription", label: "Description", type: "boolean", default: true, description: "Show each option's description line.", remixer: { control: "checkbox", group: "style", groupTitle: "Style" } },
        { name: "slideDot", label: "Slide dot", type: "boolean", default: false, description: "The dot glides from the old choice to the new one. Needs Icon on, and not used by the Full look.", remixer: { control: "checkbox", hideWhenReducedMotion: true, group: "choosing", groupTitle: "Choosing", disabledWhen: [ { prop: "appearance", equals: "full" }, { prop: "showIcon", equals: false } ] } },
        { name: "slideCard", label: "Slide card", type: "boolean", default: true, description: "The card highlight glides between cards. Needs Style set to Cards.", remixer: { control: "checkbox", hideWhenReducedMotion: true, group: "choosing", groupTitle: "Choosing", disabledWhen: { prop: "variant", equals: "default" } } },
        { name: "elastic", label: "Elastic", type: "boolean", default: true, description: "The radio squashes and springs back when picked. Needs Icon on.", remixer: { control: "checkbox", hideWhenReducedMotion: true, group: "choosing", groupTitle: "Choosing", disabledWhen: { prop: "showIcon", equals: false } } },
        { name: "appearance", label: "Look", type: "string", default: "outline", description: "Radio look: an outline ring, a filled ring or one solid circle. Needs Icon on.", remixer: { control: "select", group: "radio", groupTitle: "Radio", options: [{ label: "Outline", value: "outline" }, { label: "Filled", value: "filled" }, { label: "Full", value: "full" }], disabledWhen: { prop: "showIcon", equals: false } } },
        { name: "reorder", label: "Drag to reorder", type: "boolean", default: true, description: "Drag options up and down to reorder them.", remixer: { control: "checkbox", group: "group", groupTitle: "Group" } },
        { name: "colorful", label: "Colour per option", type: "boolean", default: false, description: "Use each option's own accent colour.", remixer: { control: "checkbox", group: "group", groupTitle: "Group" } },
      ]}
    >
      {({ values, effect }) => (
        <>
          <DemoHeader />
          <div
            {...getThemeProps(values.theme as RadioTheme, values.mode as RadioMode)}
            className="flex min-h-screen w-full flex-col items-center gap-[5vw] bg-(--hx-background) px-[5vw] pt-[12%] text-(--hx-foreground) transition-colors duration-500 max-md:gap-[8vw] max-md:py-[25%]"
          >
            <div className="flex flex-col items-center gap-[1vw]">
              <HeadAnim>
                <h1 className="text-center text-[4vw] max-md:text-[7vw] max-sm:text-[9vw]">Animated Radio Group</h1>
              </HeadAnim>
              <SplitLine>
                <p className="text-center max-md:w-[80vw]">Pick one option.<span className="max-lg:hidden"> Arrow keys, Home and End move the choice.</span></p>
              </SplitLine>
            </div>
            <div className="w-[40vw] max-lg:w-[75vw] max-md:w-full">{effect}</div>
          </div>
        </>
      )}
    </LocalRemixerDemo>
  );
}
