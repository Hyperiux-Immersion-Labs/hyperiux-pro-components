import SuggestedEffectRemixerDemo from "@/components/remixer-panel/SuggestedEffectRemixerDemo";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import registry from "../../../../../../../registry/effects/carousels/zoom-slider/registry.json";

export default function Page() {
  return <SuggestedEffectRemixerDemo registry={registry} slug="zoom-slider" />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("zoom-slider");
}
