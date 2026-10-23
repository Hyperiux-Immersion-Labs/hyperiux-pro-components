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
        { name: "theme", label: "Theme", type: "string", default: "valorant", description: "Colour palette. Sent bubbles take its primary colour, replies its muted colour.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Default", value: "default" }, { label: "Caffeine", value: "caffeine" }, { label: "Claude", value: "claude" }, { label: "Ghibli", value: "ghibli" }, { label: "Spotify", value: "spotify" }, { label: "Valorant", value: "valorant" }, { label: "Vscode", value: "vscode" }] } },
        { name: "mode", label: "Mode", type: "string", default: "dark", description: "Light or dark version of the chosen palette.", remixer: { control: "select", group: "theme", groupTitle: "Theme", options: [{ label: "Light", value: "light" }, { label: "Dark", value: "dark" }] } },
        { name: "animateEnter", label: "Animate enter", type: "boolean", default: true, description: "New messages slide and fade in as they arrive.", remixer: { hideWhenReducedMotion: true, control: "checkbox", group: "arriving", groupTitle: "Arriving" } },
        { name: "typing", label: "Typing indicator", type: "boolean", default: true, description: "Shows typing dots before each reply appears.", remixer: { control: "checkbox", group: "arriving", groupTitle: "Arriving" } },
        { name: "streamText", label: "Stream text", type: "boolean", default: false, description: "Replies type themselves out word by word.", remixer: { hideWhenReducedMotion: true, control: "checkbox", group: "arriving", groupTitle: "Arriving" } },
        { name: "flyIn", label: "Fly from input", type: "boolean", default: true, description: "A sent message flies up from the input box into the chat.", remixer: { hideWhenReducedMotion: true, control: "checkbox", group: "sending", groupTitle: "Sending" } },
        { name: "showDeliveryStatus", label: "Show delivery status", type: "boolean", default: true, description: "Shows sending, sent and failed under your messages.", remixer: { control: "checkbox", group: "sending", groupTitle: "Sending" } },
        { name: "shakeOnError", label: "Shake on error", type: "boolean", default: true, description: "A message that fails to send shakes. Needs Simulate failures on.", remixer: { hideWhenReducedMotion: true, control: "checkbox", group: "sending", groupTitle: "Sending", disabledWhen: { prop: "simulateFailures", equals: false } } },
        { name: "simulateFailures", label: "Simulate failures", type: "boolean", default: true, description: "Some sends fail at random, to preview the error state.", remixer: { control: "checkbox", group: "sending", groupTitle: "Sending" } },
        { name: "popOnChange", label: "Pop on change", type: "boolean", default: true, description: "Reaction pills pop in and out as they change.", remixer: { hideWhenReducedMotion: true, control: "checkbox", group: "reactions", groupTitle: "Reactions" } },
        { name: "rollingNumbers", label: "Rolling numbers", type: "boolean", default: true, description: "Reaction counts roll to their new number.", remixer: { hideWhenReducedMotion: true, control: "checkbox", group: "reactions", groupTitle: "Reactions" } },
        { name: "doubleClickToReact", label: "Double click to react", type: "boolean", default: true, description: "Double-clicking a bubble adds a heart, or takes it off again.", remixer: { control: "checkbox", group: "reactions", groupTitle: "Reactions" } },
        { name: "showReactionPicker", label: "Show reaction picker", type: "boolean", default: true, description: "Shows a row of emoji to react with on each bubble.", remixer: { control: "checkbox", group: "reactions", groupTitle: "Reactions" } },
        { name: "magnifyEmojis", label: "Magnify emojis", type: "boolean", default: true, description: "Emoji in the picker grow as the pointer passes over them. Needs Show reaction picker on.", remixer: { hideWhenReducedMotion: true, control: "checkbox", group: "reactions", groupTitle: "Reactions", disabledWhen: { prop: "showReactionPicker", equals: false } } },
        { name: "liftOnHover", label: "Lift on hover", type: "boolean", default: true, description: "Bubbles rise slightly on hover and press in on click.", remixer: { hideWhenReducedMotion: true, control: "checkbox", group: "interaction", groupTitle: "Interaction" } },
        { name: "selectable", label: "Selectable text", type: "boolean", default: true, description: "Lets message text be selected and copied.", remixer: { control: "checkbox", group: "interaction", groupTitle: "Interaction" } },
        { name: "swipeToReply", label: "Swipe to reply", type: "boolean", default: true, description: "Drag a bubble sideways to reply to it.", remixer: { control: "checkbox", group: "interaction", groupTitle: "Interaction" } },
        { name: "showSuggestions", label: "Show suggestions", type: "boolean", default: true, description: "Shows suggested replies you can tap to send.", remixer: { control: "checkbox", group: "interaction", groupTitle: "Interaction" } },
        { name: "collapsible", label: "Collapsible", type: "boolean", default: true, description: "Long messages are clipped with a Show more toggle.", remixer: { control: "checkbox", group: "interaction", groupTitle: "Interaction" } },
        { name: "joined", label: "Joined corners", type: "boolean", default: true, description: "Bubbles in a run from the same person share tighter corners.", remixer: { control: "checkbox", group: "grouping", groupTitle: "Grouping" } },
        { name: "sendStyle", label: "Sent bubble style", type: "string", default: "default", description: "Look of the messages you send.", remixer: { control: "select", group: "grouping", groupTitle: "Grouping", options: [{ label: "Default", value: "default" }, { label: "Secondary", value: "secondary" }, { label: "Muted", value: "muted" }, { label: "Tinted", value: "tinted" }, { label: "Outline", value: "outline" }, { label: "Ghost", value: "ghost" }, { label: "Destructive", value: "destructive" }] } },
      ]}
    >
      {({ values, effect }) => (
        <>
          <DemoHeader />
          <div
            {...getThemeProps(values.theme as AnimatedChatBubbleTheme, values.mode as AnimatedChatBubbleMode)}
            className="flex min-h-screen w-full flex-col items-center gap-[3vw] bg-(--hx-background) px-[5vw] py-[7%] text-(--hx-foreground) motion-reduce:transition-none max-lg:gap-[6vw] max-lg:py-[15%] max-md:gap-[8vw] max-md:py-[25%]"
          >
            <div className="flex w-full flex-col items-center gap-[1vw] max-lg:gap-[2vw]">
              <HeadAnim>
                <h1 className="text-center text-[4vw] max-lg:text-[6vw] max-md:text-[7vw] max-sm:text-[9vw]">Animated Chat Bubble</h1>
              </HeadAnim>
              <SplitLine>
                <p className="text-center max-lg:w-[80vw]">Chat bubbles with streaming replies, reactions and swipe to reply.</p>
              </SplitLine>
            </div>
            <div className="w-[60vw] max-lg:w-[85vw] max-md:w-full">{effect}</div>
          </div>
        </>
      )}
    </LocalRemixerDemo>
  );
}
