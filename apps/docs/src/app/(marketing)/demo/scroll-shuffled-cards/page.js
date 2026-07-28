import SuggestedEffectRemixerDemo from "@/components/remixer-panel/SuggestedEffectRemixerDemo";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import registry from "../../../../../../../registry/effects/scroll/scroll-shuffled-cards/registry.json";

export default function Page() {
  return <SuggestedEffectRemixerDemo registry={registry} slug="scroll-shuffled-cards" />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("scroll-shuffled-cards");
}
