import SuggestedEffectRemixerDemo from "@/components/remixer-panel/SuggestedEffectRemixerDemo";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import registry from "../../../../../../../registry/effects/loaders/numeric-tunnel/registry.json";

export default function Page() {
  return <SuggestedEffectRemixerDemo registry={registry} slug="numeric-tunnel" />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("numeric-tunnel");
}
