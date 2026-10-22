"use client";

import AnimatedDataTable, { getThemeProps, type AnimatedDataTableTheme, type AnimatedDataTableMode } from "@/components/animated-data-table";
import HeadAnim from "@/components/Animations/HeadAnim";
import DemoHeader from "@/components/preview-chrome/DemoHeader";
import SplitLine from "@/components/WebsiteComps/SplitLine";
import LocalRemixerDemo from "@/components/local-remixer/LocalRemixerDemo";

export default function DemoContent() {
  return (
    <LocalRemixerDemo
      name="animated-data-table"
      category="components"
      render={(values) => (
        <AnimatedDataTable {...values} className="p-[2vw] max-md:p-[5vw]" />
      )}
      props={[
        { name: "theme", label: "Theme", type: "string", default: "default", description: "Colour palette for every part, popups included.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Default", value: "default" }, { label: "Caffeine", value: "caffeine" }, { label: "Claude", value: "claude" }, { label: "Ghibli", value: "ghibli" }, { label: "Spotify", value: "spotify" }, { label: "Valorant", value: "valorant" }, { label: "Vscode", value: "vscode" }] } },
        { name: "mode", label: "Mode", type: "string", default: "light", description: "Light or dark version of the palette.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Light", value: "light" }, { label: "Dark", value: "dark" }] } },
        { name: "staggerRows", label: "Stagger rows", type: "boolean", default: true, description: "Stagger rows", remixer: { control: "checkbox", group: "entrance", groupTitle: "Entrance" } },
        { name: "staggerCells", label: "Stagger cells", type: "boolean", default: false, description: "Stagger cells", remixer: { control: "checkbox", group: "entrance", groupTitle: "Entrance" } },
        { name: "numberAnimation", label: "Number animation", type: "string", default: "roll", description: "Number animation", remixer: { control: "select", group: "entrance", groupTitle: "Entrance", options: [{ label: "Roll", value: "roll" }, { label: "Count up", value: "on" }, { label: "Off", value: "off" }] } },
        { name: "duration", label: "Duration", type: "number", default: 0.4, description: "Duration", remixer: { control: "range", group: "timing", groupTitle: "Timing", min: 0.1, max: 1, step: 0.05 } },
        { name: "stagger", label: "Stagger", type: "number", default: 0.04, description: "Stagger", remixer: { control: "range", group: "timing", groupTitle: "Timing", min: 0, max: 0.15, step: 0.01 } },
        { name: "rowHighlight", label: "Row highlight", type: "string", default: "slide", description: "Row highlight", remixer: { control: "select", group: "hover", groupTitle: "Hover", options: [{ label: "Slide", value: "slide" }, { label: "Fill from top", value: "fill" }, { label: "None", value: "none" }] } },
        { name: "rowHighlightColor", label: "Row highlight color", type: "string", default: "muted", description: "Row highlight color", remixer: { control: "select", group: "hover", groupTitle: "Hover", options: [{ label: "Muted", value: "muted" }, { label: "Primary", value: "primary" }] } },
        { name: "rollingText", label: "Rolling text", type: "boolean", default: false, description: "Rolling text", remixer: { control: "checkbox", group: "hover", groupTitle: "Hover" } },
        { name: "showStatusFilter", label: "Show status filter", type: "boolean", default: true, description: "Show status filter", remixer: { control: "checkbox", group: "data", groupTitle: "Data" } },
        { name: "highlightTotal", label: "Highlight total", type: "boolean", default: false, description: "Highlight total", remixer: { control: "checkbox", group: "data", groupTitle: "Data" } },
        { name: "showPagination", label: "Show pagination", type: "boolean", default: false, description: "Show pagination", remixer: { control: "checkbox", group: "data", groupTitle: "Data" } },
        { name: "selectable", label: "Row checkboxes", type: "boolean", default: false, description: "Row checkboxes", remixer: { control: "checkbox", group: "selection", groupTitle: "Selection" } },
        { name: "showSelectAll", label: "Show select all", type: "boolean", default: true, description: "Show select all", remixer: { control: "checkbox", group: "selection", groupTitle: "Selection" } },
        { name: "selectMark", label: "Select mark", type: "string", default: "check", description: "Select mark", remixer: { control: "select", group: "selection", groupTitle: "Selection", options: [{ label: "Checkmark", value: "check" }, { label: "Filled circle", value: "circle" }] } },
        { name: "showActionBar", label: "Show action bar", type: "boolean", default: true, description: "Show action bar", remixer: { control: "checkbox", group: "selection", groupTitle: "Selection" } },
        { name: "dragMode", label: "Drag mode", type: "boolean", default: false, description: "Drag mode", remixer: { control: "checkbox", group: "rows", groupTitle: "Rows" } },
        { name: "showStatusBadges", label: "Show status badges", type: "boolean", default: true, description: "Show status badges", remixer: { control: "checkbox", group: "rows", groupTitle: "Rows" } },
        { name: "expandable", label: "Expandable preview", type: "boolean", default: false, description: "Expandable preview", remixer: { control: "checkbox", group: "rows", groupTitle: "Rows" } },
        { name: "removable", label: "Delete column", type: "boolean", default: false, description: "Delete column", remixer: { control: "checkbox", group: "rows", groupTitle: "Rows" } },
        { name: "addable", label: "Add rows", type: "boolean", default: true, description: "Add rows", remixer: { control: "checkbox", group: "rows", groupTitle: "Rows" } },
        { name: "textAlign", label: "Text alignment", type: "string", default: "left", description: "Text alignment", remixer: { control: "select", group: "layout", groupTitle: "Layout", options: [{ label: "Left", value: "left" }, { label: "Center", value: "center" }, { label: "Right", value: "right" }] } },
        { name: "bordered", label: "Border", type: "boolean", default: true, description: "Border", remixer: { control: "checkbox", group: "layout", groupTitle: "Layout" } },
        { name: "rounded", label: "Roundness", type: "string", default: "lg", description: "Roundness", remixer: { control: "select", group: "layout", groupTitle: "Layout", options: [{ label: "None", value: "none" }, { label: "sm", value: "sm" }, { label: "md", value: "md" }, { label: "lg", value: "lg" }, { label: "xl", value: "xl" }, { label: "2xl", value: "2xl" }] } },
        { name: "showHorizontalLines", label: "Show horizontal lines", type: "boolean", default: true, description: "Show horizontal lines", remixer: { control: "checkbox", group: "layout", groupTitle: "Layout" } },
        { name: "showVerticalLines", label: "Show vertical lines", type: "boolean", default: true, description: "Show vertical lines", remixer: { control: "checkbox", group: "layout", groupTitle: "Layout" } },
        { name: "showHeaderBorder", label: "Show header border", type: "boolean", default: true, description: "Show header border", remixer: { control: "checkbox", group: "layout", groupTitle: "Layout" } },
        { name: "boldHeader", label: "Bold header", type: "boolean", default: true, description: "Bold header", remixer: { control: "checkbox", group: "layout", groupTitle: "Layout" } },
        { name: "stickyHeader", label: "Sticky header", type: "boolean", default: true, description: "Sticky header", remixer: { control: "checkbox", group: "layout", groupTitle: "Layout" } },
        { name: "expandFullTable", label: "Expand full table", type: "boolean", default: false, description: "Expand full table", remixer: { control: "checkbox", group: "layout", groupTitle: "Layout" } },
        { name: "height", label: "Table height", type: "number", default: 50, description: "Table height", remixer: { control: "range", group: "layout", groupTitle: "Layout", min: 20, max: 100, step: 5 } },
        { name: "stickyFooter", label: "Sticky last row", type: "boolean", default: true, description: "Sticky last row", remixer: { control: "checkbox", group: "layout", groupTitle: "Layout" } },
        { name: "loadingSkeleton", label: "Loading skeleton", type: "boolean", default: true, description: "Loading skeleton", remixer: { control: "checkbox", group: "layout", groupTitle: "Layout" } },
      ]}
    >
      {({ values, effect }) => (
        <>
          <DemoHeader />
          <div
            {...getThemeProps(values.theme as AnimatedDataTableTheme, values.mode as AnimatedDataTableMode)}
            className="flex min-h-screen w-full flex-col items-center gap-[3vw] bg-(--hx-background) px-[5vw] py-[7%] text-(--hx-foreground) transition-colors duration-500 max-md:gap-[8vw] max-md:py-[25%]"
          >
            <div className="flex flex-col items-center gap-[1vw]">
              <HeadAnim>
                <h1 className="text-[4vw] max-md:text-[7vw] max-sm:text-[9vw]">Animated Data Table</h1>
              </HeadAnim>
              <SplitLine>
                <p className="text-center max-md:w-[80vw]">Sort, filter, select and reorder rows that glide into place.</p>
              </SplitLine>
            </div>
            <div className="w-[80vw] max-md:w-full">{effect}</div>
          </div>
        </>
      )}
    </LocalRemixerDemo>
  );
}
