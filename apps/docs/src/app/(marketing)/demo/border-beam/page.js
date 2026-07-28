import SuggestedEffectRemixerDemo from "@/components/remixer-panel/SuggestedEffectRemixerDemo";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import registry from "../../../../../../../registry/effects/components/border-beam/registry.json";

export default function Page() {
  return <SuggestedEffectRemixerDemo registry={registry} slug="border-beam" />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("border-beam");
}
