"use client";

import AnimatedChatBubble, { getThemeProps, type AnimatedChatBubbleTheme, type AnimatedChatBubbleMode } from "@/components/animated-chat-bubble";
import HeadAnim from "@/components/Animations/HeadAnim";
import DemoHeader from "@/components/preview-chrome/DemoHeader";
import SplitLine from "@/components/WebsiteComps/SplitLine";
import LocalRemixerDemo from "@/components/local-remixer/LocalRemixerDemo";

export default function DemoContent() {
  return (
    <LocalRemixerDemo
      name="animated-chat-bubble"
      category="components"
      render={(values) => (
        <AnimatedChatBubble {...values} className="p-[2vw] max-md:p-[5vw]" />
      )}
      props={[
        { name: "theme", label: "Theme", type: "string", default: "default", description: "Colour palette for every part, popups included.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Default", value: "default" }, { label: "Caffeine", value: "caffeine" }, { label: "Claude", value: "claude" }, { label: "Ghibli", value: "ghibli" }, { label: "Spotify", value: "spotify" }, { label: "Valorant", value: "valorant" }, { label: "Vscode", value: "vscode" }] } },
        { name: "mode", label: "Mode", type: "string", default: "light", description: "Light or dark version of the palette.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Light", value: "light" }, { label: "Dark", value: "dark" }] } },
        { name: "animateEnter", label: "Animate enter", type: "boolean", default: true, description: "Animate enter", remixer: { control: "checkbox", group: "arriving", groupTitle: "Arriving" } },
        { name: "typing", label: "Typing indicator", type: "boolean", default: true, description: "Typing indicator", remixer: { control: "checkbox", group: "arriving", groupTitle: "Arriving" } },
        { name: "streamText", label: "Stream text", type: "boolean", default: false, description: "Stream text", remixer: { control: "checkbox", group: "arriving", groupTitle: "Arriving" } },
        { name: "flyIn", label: "Fly from input", type: "boolean", default: false, description: "Fly from input", remixer: { control: "checkbox", group: "sending", groupTitle: "Sending" } },
        { name: "showDeliveryStatus", label: "Show delivery status", type: "boolean", default: true, description: "Show delivery status", remixer: { control: "checkbox", group: "sending", groupTitle: "Sending" } },
        { name: "shakeOnError", label: "Shake on error", type: "boolean", default: true, description: "Shake on error", remixer: { control: "checkbox", group: "sending", groupTitle: "Sending" } },
        { name: "simulateFailures", label: "Simulate failures", type: "boolean", default: true, description: "Simulate failures", remixer: { control: "checkbox", group: "sending", groupTitle: "Sending" } },
        { name: "popOnChange", label: "Pop on change", type: "boolean", default: true, description: "Pop on change", remixer: { control: "checkbox", group: "reactions", groupTitle: "Reactions" } },
        { name: "rollingNumbers", label: "Rolling numbers", type: "boolean", default: true, description: "Rolling numbers", remixer: { control: "checkbox", group: "reactions", groupTitle: "Reactions" } },
        { name: "doubleClickToReact", label: "Double click to react", type: "boolean", default: true, description: "Double click to react", remixer: { control: "checkbox", group: "reactions", groupTitle: "Reactions" } },
        { name: "showReactionPicker", label: "Show reaction picker", type: "boolean", default: true, description: "Show reaction picker", remixer: { control: "checkbox", group: "reactions", groupTitle: "Reactions" } },
        { name: "magnifyEmojis", label: "Magnify emojis", type: "boolean", default: false, description: "Magnify emojis", remixer: { control: "checkbox", group: "reactions", groupTitle: "Reactions" } },
        { name: "liftOnHover", label: "Lift on hover", type: "boolean", default: false, description: "Lift on hover", remixer: { control: "checkbox", group: "interaction", groupTitle: "Interaction" } },
        { name: "selectable", label: "Selectable text", type: "boolean", default: true, description: "Selectable text", remixer: { control: "checkbox", group: "interaction", groupTitle: "Interaction" } },
        { name: "swipeToReply", label: "Swipe to reply", type: "boolean", default: true, description: "Swipe to reply", remixer: { control: "checkbox", group: "interaction", groupTitle: "Interaction" } },
        { name: "showSuggestions", label: "Show suggestions", type: "boolean", default: true, description: "Show suggestions", remixer: { control: "checkbox", group: "interaction", groupTitle: "Interaction" } },
        { name: "collapsible", label: "Collapsible", type: "boolean", default: true, description: "Collapsible", remixer: { control: "checkbox", group: "interaction", groupTitle: "Interaction" } },
        { name: "joined", label: "Joined corners", type: "boolean", default: false, description: "Joined corners", remixer: { control: "checkbox", group: "grouping", groupTitle: "Grouping" } },
      ]}
    >
      {({ values, effect }) => (
        <>
          <DemoHeader />
          <div
            {...getThemeProps(values.theme as AnimatedChatBubbleTheme, values.mode as AnimatedChatBubbleMode)}
            className="flex min-h-screen w-full flex-col items-center gap-[3vw] bg-(--hx-background) px-[5vw] py-[7%] text-(--hx-foreground) transition-colors duration-500 max-md:gap-[8vw] max-md:py-[25%]"
          >
            <div className="flex flex-col items-center gap-[1vw]">
              <HeadAnim>
                <h1 className="text-[4vw] max-md:text-[7vw] max-sm:text-[9vw]">Animated Chat Bubble</h1>
              </HeadAnim>
              <SplitLine>
                <p className="text-center max-md:w-[80vw]">Chat bubbles with streaming replies, reactions and swipe to reply.</p>
              </SplitLine>
            </div>
            <div className="w-[60vw] max-md:w-full">{effect}</div>
          </div>
        </>
      )}
    </LocalRemixerDemo>
  );
}
