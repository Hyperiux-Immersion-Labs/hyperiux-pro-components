import SuggestedEffectRemixerDemo from "@/components/remixer-panel/SuggestedEffectRemixerDemo";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import registry from "../../../../../../../registry/effects/buttons/animated-toggle/registry.json";

export default function Page() {
  return <SuggestedEffectRemixerDemo registry={registry} slug="animated-toggle" />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("animated-toggle");
}
