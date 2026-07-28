import SuggestedEffectRemixerDemo from "@/components/remixer-panel/SuggestedEffectRemixerDemo";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import registry from "../../../../../../../registry/effects/components/hover-stack/registry.json";

export default function Page() {
  return <SuggestedEffectRemixerDemo registry={registry} slug="hover-stack" />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("hover-stack");
}
