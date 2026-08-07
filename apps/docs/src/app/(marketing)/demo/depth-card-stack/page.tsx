import SuggestedEffectRemixerDemo from "@/components/remixer-panel/SuggestedEffectRemixerDemo";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import registry from "../../../../../../../registry/effects/components/depth-card-stack/registry.json";

export default function Page() {
  return <SuggestedEffectRemixerDemo registry={registry} slug="depth-card-stack" />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("depth-card-stack");
}
