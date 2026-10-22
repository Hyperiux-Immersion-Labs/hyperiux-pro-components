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
        { name: "theme", label: "Theme", type: "string", default: "default", description: "Colour palette for every part, popups included.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Default", value: "default" }, { label: "Caffeine", value: "caffeine" }, { label: "Claude", value: "claude" }, { label: "Ghibli", value: "ghibli" }, { label: "Spotify", value: "spotify" }, { label: "Valorant", value: "valorant" }, { label: "Vscode", value: "vscode" }] } },
        { name: "mode", label: "Mode", type: "string", default: "light", description: "Light or dark version of the palette.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Light", value: "light" }, { label: "Dark", value: "dark" }] } },
        { name: "allowedCharacters", label: "Allowed characters", type: "string", default: "mixed", description: "Allowed characters", remixer: { control: "select", group: "input", groupTitle: "Input", options: [{ label: "Mixed", value: "mixed" }, { label: "Numbers", value: "numbers" }, { label: "Letters", value: "letters" }, { label: "Special characters", value: "symbols" }] } },
        { name: "glideRing", label: "Glide ring", type: "boolean", default: true, description: "Glide ring", remixer: { control: "checkbox", group: "typing", groupTitle: "Typing" } },
        { name: "charAnimation", label: "Character in", type: "string", default: "pop", description: "Character in", remixer: { control: "select", group: "typing", groupTitle: "Typing", options: [{ label: "Pop", value: "pop" }, { label: "Roll", value: "roll" }, { label: "Fade", value: "fade" }, { label: "None", value: "none" }] } },
        { name: "pasteStagger", label: "Paste stagger", type: "number", default: 0.05, description: "Paste stagger", remixer: { control: "range", group: "typing", groupTitle: "Typing", min: 0, max: 0.15, step: 0.01 } },
        { name: "shakeOnError", label: "Shake on error", type: "boolean", default: true, description: "Shake on error", remixer: { control: "checkbox", group: "result", groupTitle: "Result" } },
        { name: "successWave", label: "Green wave when right", type: "boolean", default: true, description: "Green wave when right", remixer: { control: "checkbox", group: "result", groupTitle: "Result" } },
        { name: "boxSize", label: "Box size", type: "string", default: "10", description: "Box size", remixer: { control: "select", group: "style", groupTitle: "Style", options: [{ label: "8", value: "8" }, { label: "9", value: "9" }, { label: "10", value: "10" }, { label: "11", value: "11" }, { label: "12", value: "12" }, { label: "14", value: "14" }] } },
        { name: "joined", label: "Joined boxes", type: "boolean", default: false, description: "Joined boxes", remixer: { control: "checkbox", group: "style", groupTitle: "Style" } },
        { name: "rounded", label: "Roundness", type: "string", default: "lg", description: "Roundness", remixer: { control: "select", group: "style", groupTitle: "Style", options: [{ label: "None", value: "none" }, { label: "sm", value: "sm" }, { label: "md", value: "md" }, { label: "lg", value: "lg" }, { label: "xl", value: "xl" }, { label: "Full", value: "full" }] } },
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
