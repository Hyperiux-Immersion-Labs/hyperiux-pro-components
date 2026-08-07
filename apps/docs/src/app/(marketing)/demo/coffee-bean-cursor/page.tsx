import SuggestedEffectRemixerDemo from "@/components/remixer-panel/SuggestedEffectRemixerDemo";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import registry from "../../../../../../../registry/effects/cursor/coffee-bean-cursor/registry.json";

export default function Page() {
  return <SuggestedEffectRemixerDemo registry={registry} slug="coffee-bean-cursor" />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("coffee-bean-cursor");
}
