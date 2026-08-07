import SuggestedEffectRemixerDemo from "@/components/remixer-panel/SuggestedEffectRemixerDemo";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import registry from "../../../../../../../registry/effects/components/animated-tabs/registry.json";

export default function Page() {
  return <SuggestedEffectRemixerDemo registry={registry} slug="animated-tabs" />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("animated-tabs");
}
