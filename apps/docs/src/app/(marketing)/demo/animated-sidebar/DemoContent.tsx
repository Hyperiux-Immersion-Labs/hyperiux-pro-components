"use client";

import AnimatedSidebar, { getThemeProps, type AnimatedSidebarTheme, type AnimatedSidebarMode } from "@/components/animated-sidebar";
import HeadAnim from "@/components/Animations/HeadAnim";
import DemoHeader from "@/components/preview-chrome/DemoHeader";
import SplitLine from "@/components/WebsiteComps/SplitLine";
import LocalRemixerDemo from "@/components/local-remixer/LocalRemixerDemo";

export default function DemoContent() {
  return (
    <LocalRemixerDemo
      name="animated-sidebar"
      category="components"
      render={(values) => (
        <AnimatedSidebar {...values} className="h-[85vh] overflow-hidden [transform:translateZ(0)] p-0" />
      )}
      props={[
        { name: "theme", label: "Theme", type: "string", default: "default", description: "Colour palette for every part, popups included.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Default", value: "default" }, { label: "Caffeine", value: "caffeine" }, { label: "Claude", value: "claude" }, { label: "Ghibli", value: "ghibli" }, { label: "Spotify", value: "spotify" }, { label: "Valorant", value: "valorant" }, { label: "Vscode", value: "vscode" }] } },
        { name: "mode", label: "Mode", type: "string", default: "light", description: "Light or dark version of the palette.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Light", value: "light" }, { label: "Dark", value: "dark" }] } },
        { name: "resizable", label: "Drag edge to resize", type: "boolean", default: false, description: "Drag edge to resize", remixer: { control: "checkbox", group: "sidebar", groupTitle: "Sidebar" } },
        { name: "highlightColor", label: "Highlight color", type: "string", default: "primary", description: "Highlight color", remixer: { control: "select", group: "active-item", groupTitle: "Active item", options: [{ label: "Primary", value: "primary" }, { label: "Muted", value: "muted" }] } },
        { name: "itemRounded", label: "Item roundness", type: "string", default: "none", description: "Item roundness", remixer: { control: "select", group: "active-item", groupTitle: "Active item", options: [{ label: "None", value: "none" }, { label: "sm", value: "sm" }, { label: "md", value: "md" }, { label: "lg", value: "lg" }, { label: "xl", value: "xl" }, { label: "2xl", value: "2xl" }, { label: "Full", value: "full" }] } },
        { name: "slideHighlight", label: "Slide highlight", type: "boolean", default: true, description: "Slide highlight", remixer: { control: "checkbox", group: "active-item", groupTitle: "Active item" } },
        { name: "activeIndicator", label: "Active indicator", type: "string", default: "bar", description: "Active indicator", remixer: { control: "select", group: "active-item", groupTitle: "Active item", options: [{ label: "Bar", value: "bar" }, { label: "Pulsing dot", value: "dot" }, { label: "None", value: "none" }] } },
        { name: "pressFeedback", label: "Press feedback", type: "boolean", default: false, description: "Press feedback", remixer: { control: "checkbox", group: "interaction", groupTitle: "Interaction" } },
        { name: "rollingText", label: "Rolling text", type: "boolean", default: false, description: "Rolling text", remixer: { control: "checkbox", group: "interaction", groupTitle: "Interaction" } },
        { name: "elasticTooltips", label: "Elastic tooltips", type: "boolean", default: false, description: "Elastic tooltips", remixer: { control: "checkbox", group: "interaction", groupTitle: "Interaction" } },
        { name: "rollingNumbers", label: "Rolling numbers", type: "boolean", default: true, description: "Rolling numbers", remixer: { control: "checkbox", group: "badges", groupTitle: "Badges" } },
        { name: "showTeamSwitcher", label: "Show team switcher", type: "boolean", default: false, description: "Show team switcher", remixer: { control: "checkbox", group: "header", groupTitle: "Header" } },
        { name: "spinToggle", label: "Spin toggle", type: "boolean", default: false, description: "Spin toggle", remixer: { control: "checkbox", group: "header", groupTitle: "Header" } },
        { name: "showBreadcrumb", label: "Show breadcrumb", type: "boolean", default: true, description: "Show breadcrumb", remixer: { control: "checkbox", group: "header", groupTitle: "Header" } },
        { name: "scaleContent", label: "Scale content", type: "boolean", default: true, description: "Scale content", remixer: { control: "checkbox", group: "page", groupTitle: "Page" } },
      ]}
    >
      {({ values, effect }) => (
        <>
          <DemoHeader />
          <div
            {...getThemeProps(values.theme as AnimatedSidebarTheme, values.mode as AnimatedSidebarMode)}
            className="flex min-h-screen w-full flex-col items-center gap-[3vw] bg-(--hx-background) px-[5vw] py-[7%] text-(--hx-foreground) transition-colors duration-500 max-md:gap-[8vw] max-md:py-[25%]"
          >
            <div className="flex flex-col items-center gap-[1vw]">
              <HeadAnim>
                <h1 className="text-[4vw] max-md:text-[7vw] max-sm:text-[9vw]">Animated Sidebar</h1>
              </HeadAnim>
              <SplitLine>
                <p className="text-center max-md:w-[80vw]">A collapsible side navigation with groups, badges and sub-menus.</p>
              </SplitLine>
            </div>
            <div className="w-[90vw] max-md:w-full">{effect}</div>
          </div>
        </>
      )}
    </LocalRemixerDemo>
  );
}
