"use client";

import AnimatedInputOtp, { getThemeProps, type AnimatedInputOtpTheme, type AnimatedInputOtpMode } from "@/components/animated-input-otp";
import HeadAnim from "@/components/Animations/HeadAnim";
import DemoHeader from "@/components/preview-chrome/DemoHeader";
import SplitLine from "@/components/WebsiteComps/SplitLine";
import LocalRemixerDemo from "@/components/local-remixer/LocalRemixerDemo";

export default function DemoContent() {
  return (
    <LocalRemixerDemo
      name="animated-input-otp"
      category="components"
      render={(values) => (
        <AnimatedInputOtp {...values} className="p-[2vw] max-md:p-[5vw]" />
      )}
      props={[
        { name: "theme", label: "Theme", type: "string", default: "ghibli", description: "Colour palette. Any theme but Default also tints the active box, the gliding ring and the caret.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Default", value: "default" }, { label: "Caffeine", value: "caffeine" }, { label: "Claude", value: "claude" }, { label: "Ghibli", value: "ghibli" }, { label: "Spotify", value: "spotify" }, { label: "Valorant", value: "valorant" }, { label: "Vscode", value: "vscode" }] } },
        { name: "mode", label: "Mode", type: "string", default: "dark", description: "Light or dark version of the palette. Starts dark.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Light", value: "light" }, { label: "Dark", value: "dark" }] } },
        { name: "allowedCharacters", label: "Allowed characters", type: "string", default: "mixed", description: "Which characters the boxes accept; anything else is ignored as you type or paste.", remixer: { control: "select", group: "input", groupTitle: "Input", options: [{ label: "Mixed", value: "mixed" }, { label: "Numbers", value: "numbers" }, { label: "Letters", value: "letters" }, { label: "Special characters", value: "symbols" }] } },
        { name: "glideRing", label: "Glide ring", type: "boolean", default: false, description: "One ring that slides from box to box as you type or move with the arrow keys. When off, each box just lights up on its own.", remixer: { control: "checkbox", group: "typing", groupTitle: "Typing" } },
        { name: "charAnimation", label: "Character in", type: "string", default: "pop", description: "How each character appears in its box.", remixer: { control: "select", group: "typing", groupTitle: "Typing", options: [{ label: "Pop", value: "pop" }, { label: "Roll", value: "roll" }, { label: "Fade", value: "fade" }, { label: "None", value: "none" }], hideWhenReducedMotion: true } },
        { name: "pasteStagger", label: "Paste stagger", type: "number", default: 0.05, description: "Delay between characters when a whole code is pasted, in seconds. Needs Character in set to anything but None.", remixer: { control: "range", group: "typing", groupTitle: "Typing", min: 0, max: 0.15, step: 0.01, disabledWhen: { "prop": "charAnimation", "equals": "none" }, hideWhenReducedMotion: true } },
        { name: "shakeOnError", label: "Shake on error", type: "boolean", default: true, description: "Shakes the boxes when the code is wrong or a blocked character is entered.", remixer: { control: "checkbox", group: "result", groupTitle: "Result", hideWhenReducedMotion: true } },
        { name: "successWave", label: "Success wave", type: "boolean", default: true, description: "A wave of the theme's success colour runs across the boxes when the code is right.", remixer: { control: "checkbox", group: "result", groupTitle: "Result", hideWhenReducedMotion: true } },
        { name: "boxSize", label: "Box size", type: "string", default: "16", description: "Size of each box, on Tailwind's spacing scale.", remixer: { control: "select", group: "style", groupTitle: "Style", options: [{ label: "8", value: "8" }, { label: "9", value: "9" }, { label: "10", value: "10" }, { label: "11", value: "11" }, { label: "12", value: "12" }, { label: "14", value: "14" }, { label: "16", value: "16" }, { label: "18", value: "18" }, { label: "20", value: "20" }, { label: "24", value: "24" }] } },
        { name: "joined", label: "Joined boxes", type: "boolean", default: false, description: "Joins the boxes into one bar with shared borders.", remixer: { control: "checkbox", group: "style", groupTitle: "Style" } },
        { name: "rounded", label: "Roundness", type: "string", default: "md", description: "Corner radius of the boxes. With Joined boxes on, only the outer corners round.", remixer: { control: "select", group: "style", groupTitle: "Style", options: [{ label: "None", value: "none" }, { label: "sm", value: "sm" }, { label: "md", value: "md" }, { label: "lg", value: "lg" }, { label: "xl", value: "xl" }, { label: "Full", value: "full" }] } },
      ]}
    >
      {({ values, effect }) => (
        <>
          <DemoHeader />
          <div
            {...getThemeProps(values.theme as AnimatedInputOtpTheme, values.mode as AnimatedInputOtpMode)}
            className="flex min-h-screen w-full flex-col items-center gap-[3vw] bg-(--hx-background) px-[5vw] py-[7%] text-(--hx-foreground) transition-colors duration-500 max-md:gap-[8vw] max-md:py-[25%]"
          >
            <div className="flex flex-col items-center gap-[1vw]">
              <HeadAnim>
                <h1 className="text-[4vw] max-md:text-[7vw] max-sm:text-[9vw]">Animated Input OTP</h1>
              </HeadAnim>
              <SplitLine>
                <p className="text-center max-md:w-[80vw]">One-time code boxes that fill, shake and confirm.</p>
              </SplitLine>
            </div>
            <div className="w-[60vw] max-md:w-full">{effect}</div>
          </div>
        </>
      )}
    </LocalRemixerDemo>
  );
}
