import SuggestedEffectRemixerDemo from "@/components/remixer-panel/SuggestedEffectRemixerDemo";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import registry from "../../../../../../../registry/effects/scroll/parallax-footer/registry.json";

export default function Page() {
  return <SuggestedEffectRemixerDemo registry={registry} slug="parallax-footer" />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("parallax-footer");
}
