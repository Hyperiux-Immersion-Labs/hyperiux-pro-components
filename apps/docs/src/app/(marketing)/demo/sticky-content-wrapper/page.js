import SuggestedEffectRemixerDemo from "@/components/remixer-panel/SuggestedEffectRemixerDemo";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import registry from "../../../../../../../registry/effects/scroll/sticky-content-wrapper/registry.json";

export default function Page() {
  return <SuggestedEffectRemixerDemo registry={registry} slug="sticky-content-wrapper" />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("sticky-content-wrapper");
}
