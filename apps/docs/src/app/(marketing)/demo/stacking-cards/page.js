import SuggestedEffectRemixerDemo from "@/components/remixer-panel/SuggestedEffectRemixerDemo";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import registry from "../../../../../../../registry/effects/scroll/stacking-cards/registry.json";

export default function Page() {
  return <SuggestedEffectRemixerDemo registry={registry} slug="stacking-cards" />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("stacking-cards");
}
