"use client";

import AnimatedDatePicker, { getThemeProps, type AnimatedDatePickerTheme, type AnimatedDatePickerMode } from "@/components/animated-date-picker";
import HeadAnim from "@/components/Animations/HeadAnim";
import DemoHeader from "@/components/preview-chrome/DemoHeader";
import SplitLine from "@/components/WebsiteComps/SplitLine";
import LocalRemixerDemo from "@/components/local-remixer/LocalRemixerDemo";

export default function DemoContent() {
  return (
    <LocalRemixerDemo
      name="animated-date-picker"
      category="components"
      render={(values) => (
        <AnimatedDatePicker {...values} className="flex min-h-[70vh] items-start justify-center p-[3vw] max-md:p-[5vw]" />
      )}
      props={[
        { name: "theme", label: "Theme", type: "string", default: "default", description: "Colour palette for every part, popups included.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Default", value: "default" }, { label: "Caffeine", value: "caffeine" }, { label: "Claude", value: "claude" }, { label: "Ghibli", value: "ghibli" }, { label: "Spotify", value: "spotify" }, { label: "Valorant", value: "valorant" }, { label: "Vscode", value: "vscode" }] } },
        { name: "mode", label: "Mode", type: "string", default: "light", description: "Light or dark version of the palette.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Light", value: "light" }, { label: "Dark", value: "dark" }] } },
        { name: "showIcon", label: "Icon", type: "boolean", default: true, description: "Icon", remixer: { control: "checkbox", group: "trigger", groupTitle: "Trigger" } },
        { name: "rollingText", label: "Rolling text", type: "boolean", default: true, description: "Rolling text", remixer: { control: "checkbox", group: "trigger", groupTitle: "Trigger" } },
        { name: "dateFormat", label: "Format", type: "string", default: "PPP", description: "Format", remixer: { control: "select", group: "trigger", groupTitle: "Trigger", options: [{ label: "September 28th, 2026", value: "PPP" }, { label: "Sep 28, 2026", value: "MMM d, yyyy" }, { label: "28/09/2026", value: "dd/MM/yyyy" }, { label: "09/28/2026", value: "MM/dd/yyyy" }, { label: "2026-09-28", value: "yyyy-MM-dd" }, { label: "28 Sep 2026", value: "dd MMM yyyy" }, { label: "Monday, 28 Sep", value: "EEEE, d MMM" }, { label: "September 2026", value: "MMMM yyyy" }, { label: "2026", value: "yyyy" }] } },
        { name: "fromBehind", label: "From behind trigger", type: "boolean", default: true, description: "From behind trigger", remixer: { control: "checkbox", group: "popup", groupTitle: "Popup" } },
        { name: "contentAnimation", label: "Content animation", type: "string", default: "scale", description: "Content animation", remixer: { control: "select", group: "popup", groupTitle: "Popup", options: [{ label: "Scale + fade", value: "scale" }, { label: "Fade", value: "fade" }] } },
        { name: "startScale", label: "Start scale", type: "number", default: 0.9, description: "Start scale", remixer: { control: "range", group: "popup", groupTitle: "Popup", min: 0.5, max: 1, step: 0.05 } },
        { name: "closeOnSelect", label: "Close on select", type: "boolean", default: true, description: "Close on select", remixer: { control: "checkbox", group: "popup", groupTitle: "Popup" } },
        { name: "captionLayout", label: "Header", type: "string", default: "dropdown", description: "Header", remixer: { control: "select", group: "month-change", groupTitle: "Month change", options: [{ label: "Month + year", value: "dropdown" }, { label: "Month only", value: "dropdown-months" }, { label: "Year only", value: "dropdown-years" }, { label: "Label", value: "label" }] } },
        { name: "yearsBefore", label: "Years before", type: "number", default: 10, description: "Years before", remixer: { control: "range", group: "month-change", groupTitle: "Month change", min: 0, max: 100, step: 1 } },
        { name: "yearsAfter", label: "Years after", type: "number", default: 10, description: "Years after", remixer: { control: "range", group: "month-change", groupTitle: "Month change", min: 0, max: 100, step: 1 } },
        { name: "monthAnimation", label: "Month animation", type: "string", default: "slide", description: "Month animation", remixer: { control: "select", group: "month-change", groupTitle: "Month change", options: [{ label: "Slide + fade", value: "slide" }, { label: "Fade", value: "fade" }, { label: "None", value: "none" }] } },
        { name: "monthSlideDistance", label: "Slide distance", type: "number", default: 40, description: "Slide distance", remixer: { control: "range", group: "month-change", groupTitle: "Month change", min: 5, max: 100, step: 5 } },
        { name: "slideArrows", label: "Slide arrows", type: "boolean", default: true, description: "Slide arrows", remixer: { control: "checkbox", group: "month-change", groupTitle: "Month change" } },
        { name: "hoverVariant", label: "Variant", type: "string", default: "filled", description: "Variant", remixer: { control: "select", group: "date-hover", groupTitle: "Date hover", options: [{ label: "Filled", value: "filled" }, { label: "Outline", value: "outline" }] } },
        { name: "hoverAnimation", label: "Hover animation", type: "string", default: "slide", description: "Hover animation", remixer: { control: "select", group: "date-hover", groupTitle: "Date hover", options: [{ label: "Slide", value: "slide" }, { label: "Fade", value: "fade" }] } },
        { name: "hoverDuration", label: "Glide duration", type: "number", default: 0.25, description: "Glide duration", remixer: { control: "range", group: "date-hover", groupTitle: "Date hover", min: 0.05, max: 1, step: 0.05 } },
        { name: "hoverBounce", label: "Glide bounce", type: "number", default: 0.15, description: "Glide bounce", remixer: { control: "range", group: "date-hover", groupTitle: "Date hover", min: 0, max: 0.6, step: 0.05 } },
        { name: "weekStartsOn", label: "Week starts", type: "string", default: "0", description: "Week starts", remixer: { control: "select", group: "calendar", groupTitle: "Calendar", options: [{ label: "Sunday", value: "0" }, { label: "Monday", value: "1" }] } },
        { name: "onlyCurrentMonth", label: "Only current month", type: "boolean", default: true, description: "Only current month", remixer: { control: "checkbox", group: "calendar", groupTitle: "Calendar" } },
        { name: "fixedWeeks", label: "Fixed 6 weeks", type: "boolean", default: true, description: "Fixed 6 weeks", remixer: { control: "checkbox", group: "calendar", groupTitle: "Calendar" } },
        { name: "disablePast", label: "Disable past dates", type: "boolean", default: false, description: "Disable past dates", remixer: { control: "checkbox", group: "calendar", groupTitle: "Calendar" } },
        { name: "highlightToday", label: "Highlight today", type: "boolean", default: false, description: "Highlight today", remixer: { control: "checkbox", group: "calendar", groupTitle: "Calendar" } },
      ]}
    >
      {({ values, effect }) => (
        <>
          <DemoHeader />
          <div
            {...getThemeProps(values.theme as AnimatedDatePickerTheme, values.mode as AnimatedDatePickerMode)}
            className="flex min-h-screen w-full flex-col items-center gap-[3vw] bg-(--hx-background) px-[5vw] py-[7%] text-(--hx-foreground) transition-colors duration-500 max-md:gap-[8vw] max-md:py-[25%]"
          >
            <div className="flex flex-col items-center gap-[1vw]">
              <HeadAnim>
                <h1 className="text-[4vw] max-md:text-[7vw] max-sm:text-[9vw]">Animated Date Picker</h1>
              </HeadAnim>
              <SplitLine>
                <p className="text-center max-md:w-[80vw]">A button that opens a calendar to pick a single date.</p>
              </SplitLine>
            </div>
            <div className="w-[60vw] max-md:w-full">{effect}</div>
          </div>
        </>
      )}
    </LocalRemixerDemo>
  );
}
