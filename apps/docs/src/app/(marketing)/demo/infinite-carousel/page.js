import SuggestedEffectRemixerDemo from "@/components/remixer-panel/SuggestedEffectRemixerDemo";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import registry from "../../../../../../../registry/effects/carousels/infinite-carousel/registry.json";

export default function Page() {
  return <SuggestedEffectRemixerDemo registry={registry} slug="infinite-carousel" />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("infinite-carousel");
}
