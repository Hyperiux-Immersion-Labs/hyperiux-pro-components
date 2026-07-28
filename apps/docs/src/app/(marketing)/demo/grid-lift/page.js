import SuggestedEffectRemixerDemo from "@/components/remixer-panel/SuggestedEffectRemixerDemo";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import registry from "../../../../../../../registry/effects/webgl/grid-lift/registry.json";

export default function Page() {
  return <SuggestedEffectRemixerDemo registry={registry} slug="grid-lift" />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("grid-lift");
}
