import SuggestedEffectRemixerDemo from "@/components/remixer-panel/SuggestedEffectRemixerDemo";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import registry from "../../../../../../../registry/effects/text/number-counter/registry.json";

export default function Page() {
  return <SuggestedEffectRemixerDemo registry={registry} slug="number-counter" />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("number-counter");
}
