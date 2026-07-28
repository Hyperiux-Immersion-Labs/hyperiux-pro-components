import SuggestedEffectRemixerDemo from "@/components/remixer-panel/SuggestedEffectRemixerDemo";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import registry from "../../../../../../../registry/effects/scroll/split-canvas/registry.json";

export default function Page() {
  return <SuggestedEffectRemixerDemo registry={registry} slug="split-canvas" />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("split-canvas");
}
