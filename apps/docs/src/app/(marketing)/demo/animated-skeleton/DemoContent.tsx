"use client";

import AnimatedSkeleton, { getThemeProps, type AnimatedSkeletonTheme, type AnimatedSkeletonMode } from "@/components/animated-skeleton";
import HeadAnim from "@/components/Animations/HeadAnim";
import DemoHeader from "@/components/preview-chrome/DemoHeader";
import SplitLine from "@/components/WebsiteComps/SplitLine";
import LocalRemixerDemo from "@/components/local-remixer/LocalRemixerDemo";

export default function DemoContent() {
  return (
    <LocalRemixerDemo
      name="animated-skeleton"
      category="components"
      render={(values) => (
        <AnimatedSkeleton {...values} className="p-[2vw] max-md:p-[5vw]" />
      )}
      props={[
        { name: "theme", label: "Theme", type: "string", default: "spotify", description: "Colour palette for the placeholders, their shimmer and the loaded content.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Default", value: "default" }, { label: "Caffeine", value: "caffeine" }, { label: "Claude", value: "claude" }, { label: "Ghibli", value: "ghibli" }, { label: "Spotify", value: "spotify" }, { label: "Valorant", value: "valorant" }, { label: "Vscode", value: "vscode" }] } },
        { name: "mode", label: "Mode", type: "string", default: "dark", description: "Light or dark version of the palette. Starts dark.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Light", value: "light" }, { label: "Dark", value: "dark" }] } },
        { name: "animation", label: "Animation", type: "string", default: "shimmer", description: "Loading effect drawn across the placeholders.", remixer: { control: "select", group: "skeleton-appearance", groupTitle: "Skeleton appearance", options: [{ label: "Shimmer", value: "shimmer" }, { label: "Wave", value: "wave" }, { label: "Pulse", value: "pulse" }, { label: "None", value: "none" }], hideWhenReducedMotion: true } },
        { name: "duration", label: "Duration", type: "number", default: 1.6, description: "Length of one loading cycle, in seconds. Not used when Animation is None.", remixer: { control: "range", group: "skeleton-appearance", groupTitle: "Skeleton appearance", min: 0.6, max: 3, step: 0.1, disabledWhen: { "prop": "animation", "equals": "none" }, hideWhenReducedMotion: true } },
        { name: "stagger", label: "Stagger", type: "number", default: 0.12, description: "Offset between placeholders so they don't pulse in sync, in seconds. Not used when Animation is None.", remixer: { control: "range", group: "skeleton-appearance", groupTitle: "Skeleton appearance", min: 0, max: 0.4, step: 0.02, disabledWhen: { "prop": "animation", "equals": "none" }, hideWhenReducedMotion: true } },
        { name: "rounded", label: "Roundness", type: "string", default: "md", description: "Corner radius of the placeholders.", remixer: { control: "select", group: "skeleton-appearance", groupTitle: "Skeleton appearance", options: [{ label: "None", value: "none" }, { label: "sm", value: "sm" }, { label: "md", value: "md" }, { label: "lg", value: "lg" }, { label: "xl", value: "xl" }, { label: "Full", value: "full" }] } },
        { name: "swapAnimation", label: "Swap animation", type: "string", default: "scale", description: "How the real content appears when loading finishes.", remixer: { control: "select", group: "content-transition", groupTitle: "Content transition", options: [{ label: "Rise", value: "rise" }, { label: "Scale", value: "scale" }, { label: "Fade", value: "fade" }, { label: "None", value: "none" }], hideWhenReducedMotion: true } },
        { name: "swapDuration", label: "Content entrance duration", type: "number", default: 0.5, description: "How long the real content takes to appear, in seconds. Not used when Swap animation is None.", remixer: { control: "range", group: "content-transition", groupTitle: "Content transition", min: 0.1, max: 1, step: 0.05, disabledWhen: { "prop": "swapAnimation", "equals": "none" }, hideWhenReducedMotion: true } },
        { name: "swapStagger", label: "Delay between content items", type: "number", default: 0.06, description: "Delay between content items appearing, in seconds. Not used when Swap animation is None.", remixer: { control: "range", group: "content-transition", groupTitle: "Content transition", min: 0, max: 0.2, step: 0.01, disabledWhen: { "prop": "swapAnimation", "equals": "none" }, hideWhenReducedMotion: true } },
        { name: "loadTime", label: "Skeleton loading time", type: "number", default: 3, description: "How long the Replay button pretends to load before showing the content, in seconds. The first load always takes 3 s.", remixer: { control: "range", group: "loading-preview", groupTitle: "Loading preview", min: 0.5, max: 5, step: 0.5 } },
      ]}
    >
      {({ values, effect }) => (
        <>
          <DemoHeader />
          <div
            {...getThemeProps(values.theme as AnimatedSkeletonTheme, values.mode as AnimatedSkeletonMode)}
            className="flex min-h-screen w-full flex-col items-center gap-[3vw] bg-(--hx-background) px-[5vw] py-[7%] text-(--hx-foreground) transition-colors duration-500 max-md:gap-[8vw] max-md:py-[25%]"
          >
            <div className="flex flex-col items-center gap-[1vw]">
              <HeadAnim>
                <h1 className="text-[4vw] max-md:text-[7vw] max-sm:text-[9vw]">Animated Skeleton</h1>
              </HeadAnim>
              <SplitLine>
                <p className="text-center max-md:w-[80vw]">Placeholders that shimmer while content loads.</p>
              </SplitLine>
            </div>
            <div className="w-[60vw] max-lg:w-[80vw] max-md:w-full">{effect}</div>
          </div>
        </>
      )}
    </LocalRemixerDemo>
  );
}
