import SuggestedEffectRemixerDemo from "@/components/remixer-panel/SuggestedEffectRemixerDemo";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import registry from "../../../../../../../registry/effects/webgl/strip-slider/registry.json";

export default function Page() {
  return <SuggestedEffectRemixerDemo registry={registry} slug="strip-slider" />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("strip-slider");
}
