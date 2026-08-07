import SuggestedEffectRemixerDemo from "@/components/remixer-panel/SuggestedEffectRemixerDemo";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import registry from "../../../../../../../registry/effects/webgl/infinite-grid-gallery/registry.json";

export default function Page() {
  return <SuggestedEffectRemixerDemo registry={registry} slug="infinite-grid-gallery" />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("infinite-grid-gallery");
}
