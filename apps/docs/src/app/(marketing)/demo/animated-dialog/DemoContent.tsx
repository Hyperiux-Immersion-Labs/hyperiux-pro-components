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
        <AnimatedDialog {...values} className=" max-md:p-[5vw]" />
      )}
      props={[
        { name: "theme", label: "Theme", type: "string", default: "valorant", description: "Colour palette, dialog included. Its primary colour fills the main button and the hover fill.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Default", value: "default" }, { label: "Caffeine", value: "caffeine" }, { label: "Claude", value: "claude" }, { label: "Ghibli", value: "ghibli" }, { label: "Spotify", value: "spotify" }, { label: "Valorant", value: "valorant" }, { label: "Vscode", value: "vscode" }] } },
        { name: "mode", label: "Mode", type: "string", default: "dark", description: "Light or dark version of the palette. Starts dark.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Light", value: "light" }, { label: "Dark", value: "dark" }] } },
        { name: "rollingText", label: "Rolling text", type: "boolean", default: true, description: "The trigger and button labels roll to a second copy on hover.", remixer: { control: "checkbox", group: "button", groupTitle: "Button", hideWhenReducedMotion: true } },
        { name: "fillOnHover", label: "Fill on hover", type: "boolean", default: true, description: "Buttons fill with colour from the edge on hover.", remixer: { control: "checkbox", group: "button", groupTitle: "Button" } },
        { name: "originFromTrigger", label: "Origin from trigger", type: "boolean", default: true, description: "The dialog grows out of the button that opened it instead of the centre.", remixer: { control: "checkbox", group: "opening", groupTitle: "Opening", hideWhenReducedMotion: true } },
        { name: "elastic", label: "Elastic", type: "boolean", default: true, description: "The dialog springs in with a slight overshoot.", remixer: { control: "checkbox", group: "opening", groupTitle: "Opening", hideWhenReducedMotion: true } },
        { name: "duration", label: "Duration", type: "number", default: 0.4, description: "How long the open animation takes, in seconds.", remixer: { control: "range", group: "opening", groupTitle: "Opening", min: 0.1, max: 1, step: 0.05, hideWhenReducedMotion: true } },
        { name: "bounce", label: "Bounce", type: "number", default: 0.2, description: "How much the dialog overshoots and settles. 0 is no bounce.", remixer: { control: "range", group: "opening", groupTitle: "Opening", min: 0, max: 0.6, step: 0.05, disabledWhen: { "prop": "elastic", "equals": false }, hideWhenReducedMotion: true } },
        { name: "fadeContent", label: "Fade content", type: "boolean", default: true, description: "Fades the dialog contents in as it opens.", remixer: { control: "checkbox", group: "opening", groupTitle: "Opening", hideWhenReducedMotion: true } },
        { name: "scaleContent", label: "Scale content", type: "boolean", default: false, description: "Scales the dialog contents up with the dialog.", remixer: { control: "checkbox", group: "opening", groupTitle: "Opening", disabledWhen: { "prop": "fadeContent", "equals": false }, hideWhenReducedMotion: true } },
        { name: "exitAnimation", label: "Exit animation", type: "string", default: "fade", description: "How the dialog leaves: fades, drops down, or shrinks.", remixer: { control: "select", group: "closing", groupTitle: "Closing", options: [{ label: "Fade", value: "fade" }, { label: "Drop", value: "drop" }, { label: "Shrink", value: "shrink" }], disabledWhen: { "prop": "originFromTrigger", "equals": true }, hideWhenReducedMotion: true } },
        { name: "fadeContentOut", label: "Fade content out", type: "boolean", default: true, description: "Fades the contents out when the dialog closes.", remixer: { control: "checkbox", group: "closing", groupTitle: "Closing", hideWhenReducedMotion: true } },
        { name: "dismissible", label: "Click outside closes", type: "boolean", default: true, description: "Clicking outside the dialog closes it. When off, the dialog shakes instead if Shake when blocked is on.", remixer: { control: "checkbox", group: "closing", groupTitle: "Closing" } },
        { name: "shakeOnBlock", label: "Shake when blocked", type: "boolean", default: true, description: "The dialog shakes when you click outside and it can't close.", remixer: { control: "checkbox", group: "closing", groupTitle: "Closing", disabledWhen: { "prop": "dismissible", "equals": true }, hideWhenReducedMotion: true } },
        { name: "backdrop", label: "Backdrop", type: "string", default: "blur", description: "What sits behind the dialog: nothing, a dim layer, or a blur.", remixer: { control: "select", group: "style", groupTitle: "Style", options: [{ label: "None", value: "none" }, { label: "Dim", value: "dim" }, { label: "Blur", value: "blur" }] } },
        { name: "rounded", label: "Roundness", type: "string", default: "md", description: "Corner radius of the dialog.", remixer: { control: "select", group: "style", groupTitle: "Style", options: [{ label: "None", value: "none" }, { label: "sm", value: "sm" }, { label: "md", value: "md" }, { label: "lg", value: "lg" }, { label: "xl", value: "xl" }, { label: "2xl", value: "2xl" }, { label: "3xl", value: "3xl" }] } },
      ]}
    >
      {({ values, effect }) => (
        <>
          <DemoHeader />
          <div
            {...getThemeProps(values.theme as AnimatedDialogTheme, values.mode as AnimatedDialogMode)}
            className="flex min-h-screen w-full flex-col items-center gap-[3vw] bg-(--hx-background) px-[5vw] pt-[12%] text-(--hx-foreground) motion-reduce:transition-none max-lg:gap-[6vw] max-lg:py-[15%] max-md:gap-[8vw] max-md:pt-[25%]"
          >
            <div className="flex w-full flex-col items-center gap-[1vw] max-lg:gap-[2vw]">
              <HeadAnim>
                <h1 className="text-center text-[4vw] max-lg:text-[6vw] max-md:text-[7vw] max-sm:text-[9vw]">Animated Dialog</h1>
              </HeadAnim>
              <SplitLine>
                <p className="text-center max-lg:w-[80vw]">A window over the page that asks for a decision before you carry on.</p>
              </SplitLine>
            </div>
            <div className="w-[60vw] max-lg:w-[85vw] max-md:w-full">{effect}</div>
          </div>
        </>
      )}
    </LocalRemixerDemo>
  );
}
