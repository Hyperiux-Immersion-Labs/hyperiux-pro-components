import SuggestedEffectRemixerDemo from "@/components/remixer-panel/SuggestedEffectRemixerDemo";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import registry from "../../../../../../../registry/effects/webgl/grid-tunnel/registry.json";

export default function Page() {
  return <SuggestedEffectRemixerDemo registry={registry} slug="grid-tunnel" />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("grid-tunnel");
}
