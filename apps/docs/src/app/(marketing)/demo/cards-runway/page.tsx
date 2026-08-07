import SuggestedEffectRemixerDemo from "@/components/remixer-panel/SuggestedEffectRemixerDemo";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import registry from "../../../../../../../registry/effects/components/cards-runway/registry.json";

export default function Page() {
  return <SuggestedEffectRemixerDemo registry={registry} slug="cards-runway" />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("cards-runway");
}
