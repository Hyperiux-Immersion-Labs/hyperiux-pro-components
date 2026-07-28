import SuggestedEffectRemixerDemo from "@/components/remixer-panel/SuggestedEffectRemixerDemo";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import registry from "../../../../../../../registry/effects/scroll/horizontal-feature-reveal/registry.json";

export default function Page() {
  return <SuggestedEffectRemixerDemo registry={registry} slug="horizontal-feature-reveal" />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("horizontal-feature-reveal");
}
