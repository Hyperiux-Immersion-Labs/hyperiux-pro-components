"use client";

import AnimatedChatBubble, { getThemeProps, type AnimatedChatBubbleTheme, type AnimatedChatBubbleMode } from "@/components/animated-chat-bubble";
import HeadAnim from "@/components/Animations/HeadAnim";
import DemoHeader from "@/components/preview-chrome/DemoHeader";
import SplitLine from "@/components/WebsiteComps/SplitLine";
import RegistryRemixerDemo from "@/components/remixer-panel/RegistryRemixerDemo";

export default function DemoContent({ registry }: { registry: any }) {
  return (
    <RegistryRemixerDemo registry={registry}
      render={(values) => (
        <AnimatedChatBubble {...values} className="p-[2vw] max-md:p-[5vw]" />
      )}
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
    </RegistryRemixerDemo>
  );
}
