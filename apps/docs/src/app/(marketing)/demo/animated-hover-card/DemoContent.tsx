"use client";

import AnimatedHoverCard, { getThemeProps, type AnimatedHoverCardTheme, type AnimatedHoverCardMode } from "@/components/animated-hover-card";
import HeadAnim from "@/components/Animations/HeadAnim";
import DemoHeader from "@/components/preview-chrome/DemoHeader";
import SplitLine from "@/components/WebsiteComps/SplitLine";
import LocalRemixerDemo from "@/components/local-remixer/LocalRemixerDemo";

export default function DemoContent() {
  return (
    <LocalRemixerDemo
      name="animated-hover-card"
      category="components"
      render={(values) => (
        <AnimatedHoverCard {...values} className="p-[2vw] max-md:p-[5vw]" />
      )}
      props={[
        { name: "theme", label: "Theme", type: "string", default: "valorant", description: "Colour palette, card included. Its primary colour fills the card's button.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Default", value: "default" }, { label: "Caffeine", value: "caffeine" }, { label: "Claude", value: "claude" }, { label: "Ghibli", value: "ghibli" }, { label: "Spotify", value: "spotify" }, { label: "Valorant", value: "valorant" }, { label: "Vscode", value: "vscode" }] } },
        { name: "mode", label: "Mode", type: "string", default: "dark", description: "Light or dark version of the palette. Starts dark.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Light", value: "light" }, { label: "Dark", value: "dark" }] } },
        { name: "site", label: "Website", type: "string", default: "vault.hyperiux.com", description: "Website the card previews. Needs Card shows set to Website preview.", remixer: { control: "text", group: "content", groupTitle: "Content", placeholder: "Site name or link", disabledWhen: { "prop": "source", "notEquals": "link" } } },
        { name: "source", label: "Card shows", type: "string", default: "link", description: "What the card shows: a preview of the website or manually written details.", remixer: { control: "select", group: "content", groupTitle: "Content", options: [{ label: "Website preview", value: "link" }, { label: "Manual details", value: "text" }] } },
        { name: "contentAnimation", label: "Content animation", type: "string", default: "scale", description: "How the card appears: scales and fades, or only fades.", remixer: { control: "select", group: "opening", groupTitle: "Opening", options: [{ label: "Scale + fade", value: "scale" }, { label: "Fade", value: "fade" }], hideWhenReducedMotion: true } },
        { name: "startScale", label: "Start scale", type: "number", default: 0.9, description: "Size the card starts from when it opens, as a fraction of full size.", remixer: { control: "range", group: "opening", groupTitle: "Opening", min: 0.5, max: 1, step: 0.05, disabledWhen: { "prop": "contentAnimation", "equals": "fade" }, hideWhenReducedMotion: true } },
        { name: "fadeContent", label: "Fade content", type: "boolean", default: true, description: "Fades the card contents in as it opens.", remixer: { control: "checkbox", group: "opening", groupTitle: "Opening", hideWhenReducedMotion: true } },
        { name: "openDelay", label: "Open after", type: "number", default: 0.7, description: "How long you hover before the card opens, in seconds.", remixer: { control: "range", group: "timing", groupTitle: "Timing", min: 0, max: 1, step: 0.05 } },
        { name: "closeDelay", label: "Close after", type: "number", default: 0, description: "How long after leaving before the card closes, in seconds.", remixer: { control: "range", group: "timing", groupTitle: "Timing", min: 0, max: 1, step: 0.05 } },
        { name: "followCursor", label: "Follow the pointer", type: "boolean", default: true, description: "The card follows the pointer instead of staying put.", remixer: { control: "checkbox", group: "link", groupTitle: "Link" } },
        { name: "underline", label: "Underline draws in", type: "boolean", default: true, description: "The link underline draws in on hover.", remixer: { control: "checkbox", group: "link", groupTitle: "Link", hideWhenReducedMotion: true } },
        { name: "rounded", label: "Roundness", type: "string", default: "md", description: "Corner radius of the card.", remixer: { control: "select", group: "style", groupTitle: "Style", options: [{ label: "None", value: "none" }, { label: "sm", value: "sm" }, { label: "md", value: "md" }, { label: "lg", value: "lg" }, { label: "xl", value: "xl" }, { label: "2xl", value: "2xl" }] } },
      ]}
    >
      {({ values, effect }) => (
        <>
          <DemoHeader />
          <div
            {...getThemeProps(values.theme as AnimatedHoverCardTheme, values.mode as AnimatedHoverCardMode)}
            className="flex min-h-screen w-full flex-col items-center gap-[3vw] bg-(--hx-background) px-[5vw] py-[7%] text-(--hx-foreground) transition-colors duration-500 max-md:gap-[8vw] max-md:py-[25%]"
          >
            <div className="flex flex-col items-center gap-[1vw]">
              <HeadAnim>
                <h1 className="text-center text-[4vw] max-md:text-[7vw] max-sm:text-[9vw]">Animated Hover Card</h1>
              </HeadAnim>
              <SplitLine>
                <p className="text-center max-md:w-[80vw]">A preview that appears when you hover a link.</p>
              </SplitLine>
            </div>
            <div className="w-[60vw] max-lg:w-[85vw] max-md:w-full">{effect}</div>
          </div>
        </>
      )}
    </LocalRemixerDemo>
  );
}
