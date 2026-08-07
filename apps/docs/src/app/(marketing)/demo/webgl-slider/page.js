import SuggestedEffectRemixerDemo from "@/components/remixer-panel/SuggestedEffectRemixerDemo";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import registry from "../../../../../../../registry/effects/carousels/webgl-slider/registry.json";

export default function Page() {
  return <SuggestedEffectRemixerDemo registry={registry} slug="webgl-slider" />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("webgl-slider");
}
