"use client";

import AnimatedCheckboxGroup, { getThemeProps, type CheckboxMode, type CheckboxTheme } from "@/components/animated-checkbox-group";
import HeadAnim from "@/components/Animations/HeadAnim";
import DemoHeader from "@/components/preview-chrome/DemoHeader";
import SplitLine from "@/components/WebsiteComps/SplitLine";
import LocalRemixerDemo from "@/components/local-remixer/LocalRemixerDemo";

export default function DemoContent() {
  return (
    <LocalRemixerDemo
      name="animated-checkbox-group"
      category="components"
      component={AnimatedCheckboxGroup}
      props={[
        { name: "theme", label: "Theme", type: "string", default: "default", description: "Colour palette for every part.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Default", value: "default" }, { label: "Caffeine", value: "caffeine" }, { label: "Claude", value: "claude" }, { label: "Ghibli", value: "ghibli" }, { label: "Spotify", value: "spotify" }, { label: "Valorant", value: "valorant" }, { label: "Vscode", value: "vscode" }] } },
        { name: "mode", label: "Mode", type: "string", default: "light", description: "Light or dark version of the palette.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Light", value: "light" }, { label: "Dark", value: "dark" }] } },
        { name: "variant", label: "Style", type: "string", default: "default", description: "Inline checkboxes or bordered cards.", remixer: { control: "select", group: "style", groupTitle: "Style", options: [{ label: "Inline", value: "default" }, { label: "Cards", value: "card" }] } },
        { name: "cardFillColor", label: "Card fill color", type: "string", default: "muted", description: "Fill of ticked cards: muted tint or solid accent.", remixer: { control: "select", group: "style", groupTitle: "Style", options: [{ label: "Muted", value: "muted" }, { label: "Accent", value: "accent" }] } },
        { name: "showIcon", label: "Icon", type: "boolean", default: true, description: "Show the box next to each label.", remixer: { control: "checkbox", group: "style", groupTitle: "Style" } },
        { name: "showDescription", label: "Description", type: "boolean", default: true, description: "Show each option's description line.", remixer: { control: "checkbox", group: "style", groupTitle: "Style" } },
        { name: "fill", label: "Fill from centre", type: "boolean", default: true, description: "Box and card fill grow from the centre.", remixer: { control: "checkbox", group: "ticking", groupTitle: "Ticking" } },
        { name: "elastic", label: "Elastic", type: "boolean", default: true, description: "Springy squash when a box is ticked.", remixer: { control: "checkbox", group: "ticking", groupTitle: "Ticking" } },
        { name: "mark", label: "Mark", type: "string", default: "check", description: "What appears in a ticked box.", remixer: { control: "select", group: "box", groupTitle: "Box", options: [{ label: "Check", value: "check" }, { label: "Filled circle", value: "circle-filled" }, { label: "Outline circle", value: "circle-outline" }] } },
        { name: "appearance", label: "Look", type: "string", default: "filled", description: "Filled or outline box when ticked.", remixer: { control: "select", group: "box", groupTitle: "Box", options: [{ label: "Filled", value: "filled" }, { label: "Outline", value: "outline" }] } },
        { name: "rounded", label: "Roundness", type: "string", default: "sm", description: "Box corner radius.", remixer: { control: "select", group: "box", groupTitle: "Box", options: [{ label: "None", value: "none" }, { label: "XS", value: "xs" }, { label: "SM", value: "sm" }, { label: "MD", value: "md" }, { label: "LG", value: "lg" }, { label: "Full", value: "full" }] } },
        { name: "strike", label: "Strike-through", type: "boolean", default: false, description: "Strike through ticked labels.", remixer: { control: "checkbox", group: "label", groupTitle: "Label" } },
        { name: "showSelectAll", label: "Show select all", type: "boolean", default: true, description: "Show the Select all button.", remixer: { control: "checkbox", group: "multiple", groupTitle: "Multiple select" } },
        { name: "showDeselectAll", label: "Show deselect all", type: "boolean", default: true, description: "Show the Deselect all button.", remixer: { control: "checkbox", group: "multiple", groupTitle: "Multiple select" } },
        { name: "showCounter", label: "Show counter", type: "boolean", default: true, description: "Show the rolling selected counter.", remixer: { control: "checkbox", group: "multiple", groupTitle: "Multiple select" } },
        { name: "rangeSelect", label: "Shift-click ranges", type: "boolean", default: true, description: "Shift-click ticks a range of options.", remixer: { control: "checkbox", group: "multiple", groupTitle: "Multiple select" } },
        { name: "min", label: "At least", type: "number", default: 0, description: "Fewest options that must stay ticked.", remixer: { control: "select", group: "multiple", groupTitle: "Multiple select", options: [{ label: "None", value: 0 }, { label: "1", value: 1 }, { label: "2", value: 2 }, { label: "3", value: 3 }] } },
        { name: "max", label: "At most", type: "number", default: 0, description: "Most options that can be ticked; 0 means no limit.", remixer: { control: "select", group: "multiple", groupTitle: "Multiple select", options: [{ label: "Any", value: 0 }, { label: "1", value: 1 }, { label: "2", value: 2 }, { label: "3", value: 3 }, { label: "4", value: 4 }, { label: "5", value: 5 }] } },
        { name: "reorder", label: "Drag to reorder", type: "boolean", default: false, description: "Drag options up and down to reorder them.", remixer: { control: "checkbox", group: "multiple", groupTitle: "Multiple select" } },
        { name: "colorful", label: "Colour per option", type: "boolean", default: false, description: "Use each option's own accent colour.", remixer: { control: "checkbox", group: "multiple", groupTitle: "Multiple select" } },
      ]}
    >
      {({ values, effect }) => (
        <>
          <DemoHeader />
          <div
            {...getThemeProps(values.theme as CheckboxTheme, values.mode as CheckboxMode)}
            className="flex min-h-screen w-full flex-col items-center gap-[3vw] bg-(--hx-background) px-[5vw] py-[7%] text-(--hx-foreground) transition-colors duration-500 max-md:gap-[8vw] max-md:py-[25%]"
          >
            <div className="flex flex-col items-center gap-[1vw]">
              <HeadAnim>
                <h1 className="text-[4vw] max-md:text-[7vw] max-sm:text-[9vw]">Animated Checkbox Group</h1>
              </HeadAnim>
              <SplitLine>
                <p className="text-center max-md:w-[80vw]">Tick any number of options. Shift-click ticks a range.</p>
              </SplitLine>
            </div>
            <div className="w-[50vw] max-md:w-full">{effect}</div>
          </div>
        </>
      )}
    </LocalRemixerDemo>
  );
}
