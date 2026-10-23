import DemoContent from "./DemoContent";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import animatedChatBubbleRegistry from "../../../../../../../registry/effects/components/animated-chat-bubble/registry.json";

export default function Page() {
  return <DemoContent registry={animatedChatBubbleRegistry} />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("animated-chat-bubble");
}
