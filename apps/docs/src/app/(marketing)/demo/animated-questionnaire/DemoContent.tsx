"use client";

import AnimatedQuestionnaire, { getThemeProps, type AnimatedQuestionnaireTheme, type AnimatedQuestionnaireMode } from "@/components/animated-questionnaire";
import HeadAnim from "@/components/Animations/HeadAnim";
import DemoHeader from "@/components/preview-chrome/DemoHeader";
import SplitLine from "@/components/WebsiteComps/SplitLine";
import LocalRemixerDemo from "@/components/local-remixer/LocalRemixerDemo";

export default function DemoContent() {
  return (
    <LocalRemixerDemo
      name="animated-questionnaire"
      category="components"
      render={(values) => (
        <AnimatedQuestionnaire {...values} className="p-[2vw] max-md:p-[5vw]" />
      )}
      props={[
        { name: "theme", label: "Theme", type: "string", default: "default", description: "Colour palette for every part, popups included.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Default", value: "default" }, { label: "Caffeine", value: "caffeine" }, { label: "Claude", value: "claude" }, { label: "Ghibli", value: "ghibli" }, { label: "Spotify", value: "spotify" }, { label: "Valorant", value: "valorant" }, { label: "Vscode", value: "vscode" }] } },
        { name: "mode", label: "Mode", type: "string", default: "light", description: "Light or dark version of the palette.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Light", value: "light" }, { label: "Dark", value: "dark" }] } },
        { name: "contentAnimation", label: "Content animation", type: "string", default: "slide-y", description: "Content animation", remixer: { control: "select", group: "content", groupTitle: "Content", options: [{ label: "Slide (x axis)", value: "slide-x" }, { label: "Slide (y axis)", value: "slide-y" }, { label: "Fade", value: "fade" }, { label: "Scale", value: "scale" }, { label: "None", value: "none" }] } },
        { name: "slideDistance", label: "Slide distance", type: "number", default: 20, description: "Slide distance", remixer: { control: "range", group: "content", groupTitle: "Content", min: 0, max: 50, step: 1 } },
        { name: "choiceLayout", label: "Layout", type: "string", default: "card", description: "Layout", remixer: { control: "select", group: "choices", groupTitle: "Choices", options: [{ label: "Cards", value: "card" }, { label: "Inline radio", value: "inline" }] } },
        { name: "choiceHover", label: "Choice hover", type: "string", default: "top", description: "Choice hover", remixer: { control: "select", group: "choices", groupTitle: "Choices", options: [{ label: "Fade", value: "fade" }, { label: "Fill from top", value: "top" }] } },
        { name: "choiceColor", label: "Selected color", type: "string", default: "primary", description: "Selected color", remixer: { control: "select", group: "choices", groupTitle: "Choices", options: [{ label: "Muted", value: "muted" }, { label: "Primary", value: "primary" }] } },
        { name: "indicatorRounded", label: "Icon roundness", type: "string", default: "full", description: "Icon roundness", remixer: { control: "select", group: "choices", groupTitle: "Choices", options: [{ label: "None", value: "none" }, { label: "sm", value: "sm" }, { label: "md", value: "md" }, { label: "lg", value: "lg" }, { label: "Full", value: "full" }] } },
        { name: "indicatorBorder", label: "Icon border", type: "boolean", default: false, description: "Icon border", remixer: { control: "checkbox", group: "choices", groupTitle: "Choices" } },
        { name: "choiceIndicator", label: "Indicator", type: "string", default: "check", description: "Indicator", remixer: { control: "select", group: "choices", groupTitle: "Choices", options: [{ label: "Check icon", value: "check" }, { label: "Radio", value: "radio" }, { label: "None", value: "none" }] } },
        { name: "bordered", label: "Show border", type: "boolean", default: true, description: "Show border", remixer: { control: "checkbox", group: "border", groupTitle: "Border" } },
        { name: "multiple", label: "Choose multiple", type: "boolean", default: false, description: "Choose multiple", remixer: { control: "checkbox", group: "choices", groupTitle: "Choices" } },
        { name: "staggerChoices", label: "Stagger choices", type: "boolean", default: true, description: "Stagger choices", remixer: { control: "checkbox", group: "choices", groupTitle: "Choices" } },
        { name: "stagger", label: "Stagger", type: "number", default: 0.05, description: "Stagger", remixer: { control: "range", group: "choices", groupTitle: "Choices", min: 0, max: 0.2, step: 0.01 } },
        { name: "showProgress", label: "Show progress", type: "boolean", default: true, description: "Show progress", remixer: { control: "checkbox", group: "progress", groupTitle: "Progress" } },
        { name: "shortcuts", label: "Choice keys", type: "string", default: "off", description: "Choice keys", remixer: { control: "select", group: "progress", groupTitle: "Progress", options: [{ label: "Letters (A, B, C)", value: "letters" }, { label: "Numbers (1, 2, 3)", value: "numbers" }, { label: "Off", value: "off" }] } },
        { name: "duration", label: "Duration", type: "number", default: 0.4, description: "Duration", remixer: { control: "range", group: "motion", groupTitle: "Motion", min: 0.1, max: 1, step: 0.05 } },
        { name: "bounce", label: "Bounce", type: "number", default: 0.1, description: "Bounce", remixer: { control: "range", group: "motion", groupTitle: "Motion", min: 0, max: 0.6, step: 0.05 } },
      ]}
    >
      {({ values, effect }) => (
        <>
          <DemoHeader />
          <div
            {...getThemeProps(values.theme as AnimatedQuestionnaireTheme, values.mode as AnimatedQuestionnaireMode)}
            className="flex min-h-screen w-full flex-col items-center gap-[3vw] bg-(--hx-background) px-[5vw] py-[7%] text-(--hx-foreground) transition-colors duration-500 max-md:gap-[8vw] max-md:py-[25%]"
          >
            <div className="flex flex-col items-center gap-[1vw]">
              <HeadAnim>
                <h1 className="text-[4vw] max-md:text-[7vw] max-sm:text-[9vw]">Animated Questionnaire</h1>
              </HeadAnim>
              <SplitLine>
                <p className="text-center max-md:w-[80vw]">A step-by-step set of questions with progress.</p>
              </SplitLine>
            </div>
            <div className="w-[60vw] max-md:w-full">{effect}</div>
          </div>
        </>
      )}
    </LocalRemixerDemo>
  );
}
