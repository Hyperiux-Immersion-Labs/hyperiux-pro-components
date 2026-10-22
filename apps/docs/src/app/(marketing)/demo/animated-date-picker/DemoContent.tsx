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
        { name: "showIcon", label: "Icon", type: "boolean", default: true, description: "Shows a calendar icon in the trigger button.", remixer: { control: "checkbox", group: "trigger", groupTitle: "Trigger" } },
        { name: "rollingText", label: "Rolling text", type: "boolean", default: true, description: "The button label rolls to a second copy on hover.", remixer: { control: "checkbox", group: "trigger", groupTitle: "Trigger" } },
        { name: "dateFormat", label: "Format", type: "string", default: "PPP", description: "How the chosen date is written in the trigger.", remixer: { control: "select", group: "trigger", groupTitle: "Trigger", options: [{ label: "September 28th, 2026", value: "PPP" }, { label: "Sep 28, 2026", value: "MMM d, yyyy" }, { label: "28/09/2026", value: "dd/MM/yyyy" }, { label: "09/28/2026", value: "MM/dd/yyyy" }, { label: "2026-09-28", value: "yyyy-MM-dd" }, { label: "28 Sep 2026", value: "dd MMM yyyy" }, { label: "Monday, 28 Sep", value: "EEEE, d MMM" }, { label: "September 2026", value: "MMMM yyyy" }, { label: "2026", value: "yyyy" }] } },
        { name: "fromBehind", label: "From behind trigger", type: "boolean", default: true, description: "The calendar grows out from behind the trigger instead of appearing below it.", remixer: { control: "checkbox", group: "popup", groupTitle: "Popup" } },
        { name: "contentAnimation", label: "Content animation", type: "string", default: "scale", description: "How the calendar appears: scales and fades, or only fades.", remixer: { control: "select", group: "popup", groupTitle: "Popup", options: [{ label: "Scale + fade", value: "scale" }, { label: "Fade", value: "fade" }] } },
        { name: "startScale", label: "Start scale", type: "number", default: 0.9, description: "Size the calendar starts from when it opens, as a fraction of full size.", remixer: { control: "range", group: "popup", groupTitle: "Popup", min: 0.5, max: 1, step: 0.05, disabledWhen: { "prop": "contentAnimation", "equals": "fade" } } },
        { name: "closeOnSelect", label: "Close on select", type: "boolean", default: true, description: "Closes the calendar as soon as a date is picked.", remixer: { control: "checkbox", group: "popup", groupTitle: "Popup" } },
        { name: "captionLayout", label: "Header", type: "string", default: "dropdown", description: "What the calendar header shows: month and year dropdowns, one of them, or a plain label.", remixer: { control: "select", group: "month-change", groupTitle: "Month change", options: [{ label: "Month + year", value: "dropdown" }, { label: "Month only", value: "dropdown-months" }, { label: "Year only", value: "dropdown-years" }, { label: "Label", value: "label" }] } },
        { name: "yearsBefore", label: "Years before", type: "number", default: 10, description: "How many years before this one the year dropdown goes back. Needs a Header with a year dropdown.", remixer: { control: "range", group: "month-change", groupTitle: "Month change", min: 0, max: 100, step: 1, disabledWhen: [ { "prop": "captionLayout", "equals": "label" }, { "prop": "captionLayout", "equals": "dropdown-months" } ] } },
        { name: "yearsAfter", label: "Years after", type: "number", default: 10, description: "How many years after this one the year dropdown goes forward. Needs a Header with a year dropdown.", remixer: { control: "range", group: "month-change", groupTitle: "Month change", min: 0, max: 100, step: 1, disabledWhen: [ { "prop": "captionLayout", "equals": "label" }, { "prop": "captionLayout", "equals": "dropdown-months" } ] } },
        { name: "monthAnimation", label: "Month animation", type: "string", default: "slide", description: "How the days change when you move to another month.", remixer: { control: "select", group: "month-change", groupTitle: "Month change", options: [{ label: "Slide + fade", value: "slide" }, { label: "Fade", value: "fade" }, { label: "None", value: "none" }] } },
        { name: "monthSlideDistance", label: "Slide distance", type: "number", default: 40, description: "How far the days slide when the month changes, in pixels. Needs Month animation set to Slide + fade.", remixer: { control: "range", group: "month-change", groupTitle: "Month change", min: 5, max: 100, step: 5, disabledWhen: { "prop": "monthAnimation", "notEquals": "slide" } } },
        { name: "slideArrows", label: "Slide arrows", type: "boolean", default: true, description: "The month arrows nudge in the direction they move.", remixer: { control: "checkbox", group: "month-change", groupTitle: "Month change" } },
        { name: "hoverVariant", label: "Variant", type: "string", default: "filled", description: "Style of the day highlight: filled or outline.", remixer: { control: "select", group: "date-hover", groupTitle: "Date hover", options: [{ label: "Filled", value: "filled" }, { label: "Outline", value: "outline" }] } },
        { name: "hoverAnimation", label: "Hover animation", type: "string", default: "slide", description: "How the highlight moves between days: slides or fades.", remixer: { control: "select", group: "date-hover", groupTitle: "Date hover", options: [{ label: "Slide", value: "slide" }, { label: "Fade", value: "fade" }] } },
        { name: "hoverDuration", label: "Glide duration", type: "number", default: 0.25, description: "How long the highlight takes to glide between days, in seconds.", remixer: { control: "range", group: "date-hover", groupTitle: "Date hover", min: 0.05, max: 1, step: 0.05 } },
        { name: "hoverBounce", label: "Glide bounce", type: "number", default: 0.15, description: "How much the highlight overshoots when gliding. 0 is no bounce.", remixer: { control: "range", group: "date-hover", groupTitle: "Date hover", min: 0, max: 0.6, step: 0.05, disabledWhen: { "prop": "hoverAnimation", "equals": "fade" } } },
        { name: "weekStartsOn", label: "Week starts", type: "string", default: "0", description: "First day of the week shown in the calendar.", remixer: { control: "select", group: "calendar", groupTitle: "Calendar", options: [{ label: "Sunday", value: "0" }, { label: "Monday", value: "1" }] } },
        { name: "onlyCurrentMonth", label: "Only current month", type: "boolean", default: true, description: "Hides days that belong to the previous or next month.", remixer: { control: "checkbox", group: "calendar", groupTitle: "Calendar" } },
        { name: "fixedWeeks", label: "Fixed 6 weeks", type: "boolean", default: true, description: "Always shows six weeks so the calendar keeps the same height.", remixer: { control: "checkbox", group: "calendar", groupTitle: "Calendar" } },
        { name: "disablePast", label: "Disable past dates", type: "boolean", default: false, description: "Greys out dates before today so they can't be picked.", remixer: { control: "checkbox", group: "calendar", groupTitle: "Calendar" } },
        { name: "highlightToday", label: "Highlight today", type: "boolean", default: false, description: "Gives today's date its own highlight.", remixer: { control: "checkbox", group: "calendar", groupTitle: "Calendar" } },
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
