import SuggestedEffectRemixerDemo from "@/components/remixer-panel/SuggestedEffectRemixerDemo";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import registry from "../../../../../../../registry/effects/scroll/parallax-gallery/registry.json";

export default function Page() {
  return <SuggestedEffectRemixerDemo registry={registry} slug="parallax-gallery" />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("parallax-gallery");
}
