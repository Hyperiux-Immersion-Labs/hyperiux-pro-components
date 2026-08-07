import SuggestedEffectRemixerDemo from "@/components/remixer-panel/SuggestedEffectRemixerDemo";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import registry from "../../../../../../../registry/effects/navigation/directional-menu/registry.json";

export default function Page() {
  return <SuggestedEffectRemixerDemo registry={registry} slug="directional-menu" />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("directional-menu");
}
