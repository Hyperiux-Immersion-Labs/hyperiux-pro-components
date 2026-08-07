import SuggestedEffectRemixerDemo from "@/components/remixer-panel/SuggestedEffectRemixerDemo";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import registry from "../../../../../../../registry/effects/webgl/milky-way/registry.json";

export default function Page() {
  return <SuggestedEffectRemixerDemo registry={registry} slug="milky-way" />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("milky-way");
}
