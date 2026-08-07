import SuggestedEffectRemixerDemo from "@/components/remixer-panel/SuggestedEffectRemixerDemo";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import registry from "../../../../../../../registry/effects/scroll/circular-split-roll/registry.json";

export default function Page() {
  return <SuggestedEffectRemixerDemo registry={registry} slug="circular-split-roll" />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("circular-split-roll");
}
