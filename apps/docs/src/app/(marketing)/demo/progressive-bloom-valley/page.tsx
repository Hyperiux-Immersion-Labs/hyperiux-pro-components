import SuggestedEffectRemixerDemo from "@/components/remixer-panel/SuggestedEffectRemixerDemo";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import registry from "../../../../../../../registry/effects/webgl/progressive-bloom-valley/registry.json";

export default function Page() {
  return <SuggestedEffectRemixerDemo registry={registry} slug="progressive-bloom-valley" />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("progressive-bloom-valley");
}
