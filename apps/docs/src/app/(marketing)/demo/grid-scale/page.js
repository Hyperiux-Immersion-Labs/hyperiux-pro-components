import SuggestedEffectRemixerDemo from "@/components/remixer-panel/SuggestedEffectRemixerDemo";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import registry from "../../../../../../../registry/effects/scroll/grid-scale/registry.json";

export default function Page() {
  return <SuggestedEffectRemixerDemo registry={registry} slug="grid-scale" />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("grid-scale");
}
