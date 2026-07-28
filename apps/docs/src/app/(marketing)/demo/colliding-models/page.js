import SuggestedEffectRemixerDemo from "@/components/remixer-panel/SuggestedEffectRemixerDemo";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import registry from "../../../../../../../registry/effects/webgl/colliding-models/registry.json";

export default function Page() {
  return <SuggestedEffectRemixerDemo registry={registry} slug="colliding-models" />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("colliding-models");
}
