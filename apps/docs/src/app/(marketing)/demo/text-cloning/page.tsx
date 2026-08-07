import SuggestedEffectRemixerDemo from "@/components/remixer-panel/SuggestedEffectRemixerDemo";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import registry from "../../../../../../../registry/effects/text/text-cloning/registry.json";

export default function Page() {
  return <SuggestedEffectRemixerDemo registry={registry} slug="text-cloning" />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("text-cloning");
}
