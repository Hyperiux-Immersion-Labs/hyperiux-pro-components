import SuggestedEffectRemixerDemo from "@/components/remixer-panel/SuggestedEffectRemixerDemo";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import registry from "../../../../../../../registry/effects/components/animated-modal/registry.json";

export default function Page() {
  return <SuggestedEffectRemixerDemo registry={registry} slug="animated-modal" />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("animated-modal");
}
