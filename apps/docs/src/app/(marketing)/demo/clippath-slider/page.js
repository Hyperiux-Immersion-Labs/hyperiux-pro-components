import SuggestedEffectRemixerDemo from "@/components/remixer-panel/SuggestedEffectRemixerDemo";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import registry from "../../../../../../../registry/effects/carousels/clippath-slider/registry.json";

export default function Page() {
  return <SuggestedEffectRemixerDemo registry={registry} slug="clippath-slider" />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("clippath-slider");
}
