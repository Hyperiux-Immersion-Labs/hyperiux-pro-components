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
        { name: "theme", label: "Theme", type: "string", default: "spotify", description: "Colour palette. The progress bar, the hover fill and a Primary selected colour take its primary colour.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Default", value: "default" }, { label: "Caffeine", value: "caffeine" }, { label: "Claude", value: "claude" }, { label: "Ghibli", value: "ghibli" }, { label: "Spotify", value: "spotify" }, { label: "Valorant", value: "valorant" }, { label: "Vscode", value: "vscode" }] } },
        { name: "mode", label: "Mode", type: "string", default: "dark", description: "Light or dark version of the palette. Starts dark.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Light", value: "light" }, { label: "Dark", value: "dark" }] } },
        { name: "contentAnimation", label: "Content animation", type: "string", default: "slide-y", description: "How one question leaves and the next arrives.", remixer: { control: "select", group: "content", groupTitle: "Content", options: [{ label: "Slide (x axis)", value: "slide-x" }, { label: "Slide (y axis)", value: "slide-y" }, { label: "Fade", value: "fade" }, { label: "Scale", value: "scale" }, { label: "None", value: "none" }], hideWhenReducedMotion: true } },
        { name: "slideDistance", label: "Slide distance", type: "number", default: 20, description: "How far questions slide, as a percentage of their own size (width sideways, height up and down). Needs a Slide content animation.", remixer: { control: "range", group: "content", groupTitle: "Content", min: 0, max: 50, step: 1, disabledWhen: { "prop": "contentAnimation", "in": [ "fade", "scale", "none" ] }, hideWhenReducedMotion: true } },
        { name: "choiceLayout", label: "Layout", type: "string", default: "card", description: "Choices as full-width cards, or as a compact list of radio buttons.", remixer: { control: "select", group: "choices", groupTitle: "Choices", options: [{ label: "Cards", value: "card" }, { label: "Inline radio", value: "inline" }] } },
        { name: "choiceHover", label: "Choice hover", type: "string", default: "top", description: "Hover effect on a choice: a fade, or a fill that grows down from the top. Needs Layout set to Cards.", remixer: { control: "select", group: "choices", groupTitle: "Choices", options: [{ label: "Fade", value: "fade" }, { label: "Fill from top", value: "top" }], disabledWhen: { "prop": "choiceLayout", "equals": "inline" } } },
        { name: "choiceColor", label: "Selected color", type: "string", default: "primary", description: "Background of the selected choice. Needs Layout set to Cards.", remixer: { control: "select", group: "choices", groupTitle: "Choices", options: [{ label: "Muted", value: "muted" }, { label: "Primary", value: "primary" }], disabledWhen: { "prop": "choiceLayout", "equals": "inline" } } },
        { name: "indicatorRounded", label: "Icon roundness", type: "string", default: "full", description: "Corner radius of the check icon box. Needs Indicator set to Check icon and Icon border on.", remixer: { control: "select", group: "choices", groupTitle: "Choices", options: [{ label: "None", value: "none" }, { label: "sm", value: "sm" }, { label: "md", value: "md" }, { label: "lg", value: "lg" }, { label: "Full", value: "full" }], disabledWhen: [ { "prop": "choiceIndicator", "notEquals": "check" }, { "prop": "indicatorBorder", "equals": false } ] } },
        { name: "indicatorBorder", label: "Icon border", type: "boolean", default: false, description: "Draws a border around the check icon box. Needs Indicator set to Check icon.", remixer: { control: "checkbox", group: "choices", groupTitle: "Choices", disabledWhen: { "prop": "choiceIndicator", "notEquals": "check" } } },
        { name: "choiceIndicator", label: "Indicator", type: "string", default: "check", description: "Mark shown on a chosen option.", remixer: { control: "select", group: "choices", groupTitle: "Choices", options: [{ label: "Check icon", value: "check" }, { label: "Radio", value: "radio" }, { label: "None", value: "none" }] } },
        { name: "bordered", label: "Show border", type: "boolean", default: true, description: "Draws a border around the whole questionnaire.", remixer: { control: "checkbox", group: "border", groupTitle: "Border" } },
        { name: "multiple", label: "Choose multiple", type: "boolean", default: false, description: "Lets every question accept more than one answer.", remixer: { control: "checkbox", group: "choices", groupTitle: "Choices" } },
        { name: "staggerChoices", label: "Stagger choices", type: "boolean", default: true, description: "Choices appear one after another instead of all at once.", remixer: { control: "checkbox", group: "choices", groupTitle: "Choices", hideWhenReducedMotion: true } },
        { name: "stagger", label: "Stagger", type: "number", default: 0.05, description: "Delay between choices appearing, in seconds. Needs Stagger choices on.", remixer: { control: "range", group: "choices", groupTitle: "Choices", min: 0, max: 0.2, step: 0.01, disabledWhen: { "prop": "staggerChoices", "equals": false }, hideWhenReducedMotion: true } },
        { name: "showProgress", label: "Show progress", type: "boolean", default: true, description: "Shows the question count and a progress bar above the question.", remixer: { control: "checkbox", group: "progress", groupTitle: "Progress" } },
        { name: "shortcuts", label: "Choice keys", type: "string", default: "off", description: "Keyboard keys that pick a choice, shown on each choice.", remixer: { control: "select", group: "choices", groupTitle: "Choices", options: [{ label: "Letters (A, B, C)", value: "letters" }, { label: "Numbers (1, 2, 3)", value: "numbers" }, { label: "Off", value: "off" }] } },
        { name: "duration", label: "Duration", type: "number", default: 0.4, description: "How long a question change takes, in seconds. Not used when Content animation is None.", remixer: { control: "range", group: "motion", groupTitle: "Motion", min: 0.1, max: 1, step: 0.05, disabledWhen: { "prop": "contentAnimation", "equals": "none" }, hideWhenReducedMotion: true } },
        { name: "bounce", label: "Bounce", type: "number", default: 0.1, description: "Springiness of the question change. Only used by the slide and scale animations.", remixer: { control: "range", group: "motion", groupTitle: "Motion", min: 0, max: 0.6, step: 0.05, disabledWhen: [ { "prop": "contentAnimation", "equals": "fade" }, { "prop": "contentAnimation", "equals": "none" } ], hideWhenReducedMotion: true } },
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
