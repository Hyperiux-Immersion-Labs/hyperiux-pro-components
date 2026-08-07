import SuggestedEffectRemixerDemo from "@/components/remixer-panel/SuggestedEffectRemixerDemo";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import registry from "../../../../../../../registry/effects/components/animated-form/registry.json";

export default function Page() {
  return <SuggestedEffectRemixerDemo registry={registry} slug="animated-form" />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("animated-form");
}
