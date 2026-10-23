"use client";

import AnimatedToast, { getThemeProps, type AnimatedToastTheme, type AnimatedToastMode } from "@/components/animated-toast";
import HeadAnim from "@/components/Animations/HeadAnim";
import DemoHeader from "@/components/preview-chrome/DemoHeader";
import SplitLine from "@/components/WebsiteComps/SplitLine";
import LocalRemixerDemo from "@/components/local-remixer/LocalRemixerDemo";

export default function DemoContent() {
  return (
    <LocalRemixerDemo
      name="animated-toast"
      category="components"
      render={(values) => (
        <AnimatedToast {...values} className=" max-md:p-[5vw]" />
      )}
      props={[
        { name: "theme", label: "Theme", type: "string", default: "claude", description: "Colour palette, toasts included. Any theme but Default also tints the timer bar.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Default", value: "default" }, { label: "Caffeine", value: "caffeine" }, { label: "Claude", value: "claude" }, { label: "Ghibli", value: "ghibli" }, { label: "Spotify", value: "spotify" }, { label: "Valorant", value: "valorant" }, { label: "Vscode", value: "vscode" }] } },
        { name: "mode", label: "Mode", type: "string", default: "dark", description: "Light or dark version of the palette. Starts dark.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Light", value: "light" }, { label: "Dark", value: "dark" }] } },
        { name: "variant", label: "Variant", type: "string", default: "success", description: "Kind of message. Loading → success shows a spinner, then succeeds after a moment.", remixer: { control: "select", group: "toast", groupTitle: "Toast", options: [{ label: "Default", value: "default" }, { label: "Success", value: "success" }, { label: "Info", value: "info" }, { label: "Warning", value: "warning" }, { label: "Error", value: "error" }, { label: "Loading → success", value: "loading" }] } },
        { name: "showDescription", label: "Description", type: "boolean", default: true, description: "Adds a second line of detail under the title.", remixer: { control: "checkbox", group: "toast", groupTitle: "Toast" } },
        { name: "collapsibleDescription", label: "Collapsible description", type: "boolean", default: true, description: "Long descriptions fold to one line with a toggle to expand. Needs Description on.", remixer: { control: "checkbox", group: "toast", groupTitle: "Toast", disabledWhen: { "prop": "showDescription", "equals": false } } },
        { name: "showAction", label: "Show action", type: "boolean", default: true, description: "Adds an Undo button to the toast.", remixer: { control: "checkbox", group: "toast", groupTitle: "Toast" } },
        { name: "timeout", label: "Stays for", type: "number", default: 5, description: "How long a toast stays before closing itself, in seconds. 0 keeps it until dismissed.", remixer: { control: "range", group: "behaviour", groupTitle: "Behaviour", min: 0, max: 15, step: 1 } },
        { name: "elastic", label: "Elastic", type: "boolean", default: true, description: "Toasts spring in with a slight overshoot.", remixer: { control: "checkbox", group: "animation", groupTitle: "Animation", hideWhenReducedMotion: true } },
        { name: "originFromTrigger", label: "Origin from trigger", type: "boolean", default: false, description: "Toasts grow out of the button that opened them.", remixer: { control: "checkbox", group: "animation", groupTitle: "Animation", hideWhenReducedMotion: true } },
        { name: "fadeContent", label: "Fade content", type: "boolean", default: true, description: "The toast's text fades in just after the toast arrives.", remixer: { control: "checkbox", group: "animation", groupTitle: "Animation", hideWhenReducedMotion: true } },
        { name: "exitAnimation", label: "Exit animation", type: "string", default: "fade", description: "How a toast leaves when it closes.", remixer: { control: "select", group: "animation", groupTitle: "Animation", options: [{ label: "Fade out", value: "fade" }, { label: "Slide off", value: "slide" }], hideWhenReducedMotion: true } },
        { name: "tiltOnSwipe", label: "Tilt on swipe", type: "boolean", default: true, description: "Toasts tilt in the direction you swipe them away.", remixer: { control: "checkbox", group: "animation", groupTitle: "Animation", hideWhenReducedMotion: true } },
        { name: "morphIcon", label: "Loading → tick morph", type: "boolean", default: false, description: "The loading spinner morphs into a tick on success. Only for the Loading → success variant, or after Undo with Show action on.", remixer: { control: "checkbox", group: "animation", groupTitle: "Animation", hideWhenReducedMotion: true } },
        { name: "showTimerBar", label: "Show timer bar", type: "boolean", default: true, description: "A bar shrinks to show the time left. Not used with Stays for 0; with Loading → success it appears after the success.", remixer: { control: "checkbox", group: "animation", groupTitle: "Animation", disabledWhen: { "prop": "timeout", "equals": 0 }, hideWhenReducedMotion: true } },
        { name: "glass", label: "Glass", type: "boolean", default: true, description: "Frosted, see-through background.", remixer: { control: "checkbox", group: "style", groupTitle: "Style" } },
        { name: "showAccentEdge", label: "Show accent edge", type: "boolean", default: true, description: "A coloured line on the edge for success, info, warning and error toasts. Not used by Default.", remixer: { control: "checkbox", group: "style", groupTitle: "Style", disabledWhen: { "prop": "variant", "equals": "default" } } },
        { name: "rounded", label: "Roundness", type: "string", default: "md", description: "Corner radius of the toasts.", remixer: { control: "select", group: "style", groupTitle: "Style", options: [{ label: "None", value: "none" }, { label: "Medium", value: "md" }, { label: "Large", value: "lg" }, { label: "xl", value: "xl" }, { label: "2xl", value: "2xl" }, { label: "3xl", value: "3xl" }, { label: "Full (pill)", value: "full" }] } },
        { name: "position", label: "Position", type: "string", default: "bottom-center", description: "Where on the screen toasts stack.", remixer: { control: "select", group: "style", groupTitle: "Style", options: [{ label: "Bottom right", value: "bottom-right" }, { label: "Bottom left", value: "bottom-left" }, { label: "Bottom centre", value: "bottom-center" }, { label: "Top right", value: "top-right" }, { label: "Top left", value: "top-left" }, { label: "Top centre", value: "top-center" }] } },
      ]}
    >
      {({ values, effect }) => (
        <>
          <DemoHeader />
          <div
            {...getThemeProps(values.theme as AnimatedToastTheme, values.mode as AnimatedToastMode)}
            className="flex min-h-screen w-full flex-col items-center gap-[3vw] bg-(--hx-background) px-[5vw] pt-[12%] text-(--hx-foreground) transition-colors duration-500 max-md:gap-[8vw] max-md:py-[25%]"
          >
            <div className="flex flex-col items-center gap-[1vw]">
              <HeadAnim>
                <h1 className="text-[4vw] max-md:text-[7vw] max-sm:text-[9vw]">Animated Toast</h1>
              </HeadAnim>
              <SplitLine>
                <p className="text-center max-md:w-[80vw]">Brief messages that stack in the corner and can be swiped away.</p>
              </SplitLine>
            </div>
            <div className="w-[60vw] max-lg:w-[85vw] max-md:w-full">{effect}</div>
          </div>
        </>
      )}
    </LocalRemixerDemo>
  );
}
