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
        { name: "theme", label: "Theme", type: "string", default: "vscode", description: "Colour palette, tooltips included. With Highlight color set to Primary, the active item takes its primary colour.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Default", value: "default" }, { label: "Caffeine", value: "caffeine" }, { label: "Claude", value: "claude" }, { label: "Ghibli", value: "ghibli" }, { label: "Spotify", value: "spotify" }, { label: "Valorant", value: "valorant" }, { label: "Vscode", value: "vscode" }] } },
        { name: "mode", label: "Mode", type: "string", default: "dark", description: "Light or dark version of the palette. Starts dark.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Light", value: "light" }, { label: "Dark", value: "dark" }] } },
        { name: "resizable", label: "Drag edge to resize", type: "boolean", default: true, description: "Lets you drag the sidebar's edge to change its width.", remixer: { control: "checkbox", group: "sidebar", groupTitle: "Sidebar" } },
        { name: "highlightColor", label: "Highlight color", type: "string", default: "primary", description: "Background of the active item.", remixer: { control: "select", group: "active-item", groupTitle: "Active item", options: [{ label: "Primary", value: "primary" }, { label: "Muted", value: "muted" }] } },
        { name: "itemRounded", label: "Item roundness", type: "string", default: "none", description: "Corner radius of the items and their highlight.", remixer: { control: "select", group: "active-item", groupTitle: "Active item", options: [{ label: "None", value: "none" }, { label: "sm", value: "sm" }, { label: "md", value: "md" }, { label: "lg", value: "lg" }, { label: "xl", value: "xl" }, { label: "2xl", value: "2xl" }, { label: "Full", value: "full" }] } },
        { name: "slideHighlight", label: "Slide highlight", type: "boolean", default: true, description: "The active highlight slides to the newly chosen item instead of jumping.", remixer: { control: "checkbox", group: "active-item", groupTitle: "Active item", hideWhenReducedMotion: true } },
        { name: "activeIndicator", label: "Active indicator", type: "string", default: "bar", description: "Extra mark on the active item.", remixer: { control: "select", group: "active-item", groupTitle: "Active item", options: [{ label: "Bar", value: "bar" }, { label: "Pulsing dot", value: "dot" }, { label: "None", value: "none" }] } },
        { name: "pressFeedback", label: "Press feedback", type: "boolean", default: false, description: "Items squeeze slightly when pressed.", remixer: { control: "checkbox", group: "interaction", groupTitle: "Interaction", hideWhenReducedMotion: true } },
        { name: "rollingText", label: "Rolling text", type: "boolean", default: true, description: "Item labels roll to a second copy on hover.", remixer: { control: "checkbox", group: "interaction", groupTitle: "Interaction", hideWhenReducedMotion: true } },
        { name: "elasticTooltips", label: "Elastic tooltips", type: "boolean", default: false, description: "Tooltips spring out when the sidebar is collapsed to icons.", remixer: { control: "checkbox", group: "interaction", groupTitle: "Interaction", hideWhenReducedMotion: true } },
        { name: "rollingNumbers", label: "Rolling numbers", type: "boolean", default: true, description: "Badge counts roll to the new number and pop.", remixer: { control: "checkbox", group: "badges", groupTitle: "Badges", hideWhenReducedMotion: true } },
        { name: "showTeamSwitcher", label: "Show team switcher", type: "boolean", default: false, description: "Shows a team menu at the top of the sidebar.", remixer: { control: "checkbox", group: "header", groupTitle: "Header" } },
        { name: "spinToggle", label: "Spin toggle", type: "boolean", default: false, description: "The collapse button spins half a turn on hover.", remixer: { control: "checkbox", group: "header", groupTitle: "Header", hideWhenReducedMotion: true } },
        { name: "showBreadcrumb", label: "Show breadcrumb", type: "boolean", default: true, description: "Shows a breadcrumb and search in the page header.", remixer: { control: "checkbox", group: "header", groupTitle: "Header" } },
        { name: "scaleContent", label: "Scale content", type: "boolean", default: true, description: "Page content scales and fades slightly when you switch pages.", remixer: { control: "checkbox", group: "page", groupTitle: "Page", hideWhenReducedMotion: true } },
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
