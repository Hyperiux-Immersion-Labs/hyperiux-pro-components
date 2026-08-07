import SuggestedEffectRemixerDemo from "@/components/remixer-panel/SuggestedEffectRemixerDemo";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import registry from "../../../../../../../registry/effects/webgl/hover-slider/registry.json";

export default function Page() {
  return <SuggestedEffectRemixerDemo registry={registry} slug="hover-slider" />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("hover-slider");
}
