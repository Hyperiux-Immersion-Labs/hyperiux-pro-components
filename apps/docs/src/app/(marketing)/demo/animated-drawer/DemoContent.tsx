"use client";

import AnimatedDrawer, { getThemeProps, type AnimatedDrawerTheme, type AnimatedDrawerMode } from "@/components/animated-drawer";
import HeadAnim from "@/components/Animations/HeadAnim";
import DemoHeader from "@/components/preview-chrome/DemoHeader";
import SplitLine from "@/components/WebsiteComps/SplitLine";
import LocalRemixerDemo from "@/components/local-remixer/LocalRemixerDemo";

export default function DemoContent() {
  return (
    <LocalRemixerDemo
      name="animated-drawer"
      category="components"
      render={(values) => (
        <AnimatedDrawer {...values} className="p-[2vw] max-md:p-[5vw]" />
      )}
      props={[
        { name: "theme", label: "Theme", type: "string", default: "default", description: "Colour palette, drawer included. Its primary colour fills the main button and the hover fill.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Default", value: "default" }, { label: "Caffeine", value: "caffeine" }, { label: "Claude", value: "claude" }, { label: "Ghibli", value: "ghibli" }, { label: "Spotify", value: "spotify" }, { label: "Valorant", value: "valorant" }, { label: "Vscode", value: "vscode" }] } },
        { name: "mode", label: "Mode", type: "string", default: "dark", description: "Light or dark version of the palette. Starts dark.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Light", value: "light" }, { label: "Dark", value: "dark" }] } },
        { name: "rollingText", label: "Rolling text", type: "boolean", default: true, description: "The trigger and button labels roll to a second copy on hover.", remixer: { control: "checkbox", group: "button", groupTitle: "Button", hideWhenReducedMotion: true } },
        { name: "fillOnHover", label: "Fill on hover", type: "boolean", default: false, description: "Buttons fill with colour from the edge on hover.", remixer: { control: "checkbox", group: "button", groupTitle: "Button" } },
        { name: "side", label: "Side", type: "string", default: "bottom", description: "Which edge of the screen the drawer slides in from.", remixer: { control: "select", group: "drawer", groupTitle: "Drawer", options: [{ label: "Bottom", value: "bottom" }, { label: "Top", value: "top" }, { label: "Left", value: "left" }, { label: "Right", value: "right" }] } },
        { name: "showSwipeHandle", label: "Swipe handle", type: "boolean", default: true, description: "Shows a handle you can grab to swipe the drawer away.", remixer: { control: "checkbox", group: "drawer", groupTitle: "Drawer" } },
        { name: "openAnimation", label: "Opens with", type: "string", default: "slide", description: "How the drawer arrives: slides in or fades in.", remixer: { control: "select", group: "motion", groupTitle: "Motion", options: [{ label: "Slide", value: "slide" }, { label: "Fade", value: "fade" }], hideWhenReducedMotion: true } },
        { name: "elastic", label: "Elastic", type: "boolean", default: true, description: "The drawer springs in with a slight overshoot.", remixer: { control: "checkbox", group: "motion", groupTitle: "Motion", disabledWhen: { "prop": "openAnimation", "equals": "fade" }, hideWhenReducedMotion: true } },
        { name: "duration", label: "Duration", type: "number", default: 0.5, description: "How long the open animation takes, in seconds.", remixer: { control: "range", group: "motion", groupTitle: "Motion", min: 0.2, max: 1.2, step: 0.05, hideWhenReducedMotion: true } },
        { name: "bounce", label: "Bounce", type: "number", default: 0.2, description: "How much the drawer overshoots and settles. 0 is no bounce.", remixer: { control: "range", group: "motion", groupTitle: "Motion", min: 0, max: 0.6, step: 0.05, disabledWhen: [ { "prop": "elastic", "equals": false }, { "prop": "openAnimation", "equals": "fade" } ], hideWhenReducedMotion: true } },
        { name: "stagger", label: "Stagger", type: "number", default: 0.04, description: "Delay between each piece of drawer content appearing, in seconds.", remixer: { control: "range", group: "motion", groupTitle: "Motion", min: 0, max: 0.15, step: 0.01, hideWhenReducedMotion: true } },
        { name: "tiltOnSwipe", label: "Tilt on swipe", type: "boolean", default: false, description: "The drawer tilts slightly as you swipe it.", remixer: { control: "checkbox", group: "motion", groupTitle: "Motion", hideWhenReducedMotion: true } },
        { name: "scaleBackground", label: "Shrink page behind", type: "boolean", default: true, description: "The page behind shrinks a little while the drawer is open.", remixer: { control: "checkbox", group: "motion", groupTitle: "Motion", hideWhenReducedMotion: true } },
      ]}
    >
      {({ values, effect }) => (
        <>
          <DemoHeader />
          <div
            {...getThemeProps(values.theme as AnimatedDrawerTheme, values.mode as AnimatedDrawerMode)}
            className="flex min-h-screen w-full flex-col items-center gap-[3vw] bg-(--hx-background) px-[5vw] py-[7%] text-(--hx-foreground) transition-colors duration-500 max-md:gap-[8vw] max-md:py-[25%]"
          >
            <div className="flex flex-col items-center gap-[1vw]">
              <HeadAnim>
                <h1 className="text-center text-[4vw] max-md:text-[7vw] max-sm:text-[9vw]">Animated Drawer</h1>
              </HeadAnim>
              <SplitLine>
                <p className="text-center max-md:w-[80vw]">A panel that slides in from the edge and can be swiped away.</p>
              </SplitLine>
            </div>
            <div className="w-[60vw] max-lg:w-[85vw] max-md:w-full">{effect}</div>
          </div>
        </>
      )}
    </LocalRemixerDemo>
  );
}
