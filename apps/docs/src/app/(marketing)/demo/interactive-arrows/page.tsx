import SuggestedEffectRemixerDemo from "@/components/remixer-panel/SuggestedEffectRemixerDemo";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import registry from "../../../../../../../registry/effects/cursor/interactive-arrows/registry.json";

export default function Page() {
  return <SuggestedEffectRemixerDemo registry={registry} slug="interactive-arrows" />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("interactive-arrows");
}
