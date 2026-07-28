import SuggestedEffectRemixerDemo from "@/components/remixer-panel/SuggestedEffectRemixerDemo";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import registry from "../../../../../../../registry/effects/scroll/draggable-marquee/registry.json";

export default function Page() {
  return <SuggestedEffectRemixerDemo registry={registry} slug="draggable-marquee" />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("draggable-marquee");
}
