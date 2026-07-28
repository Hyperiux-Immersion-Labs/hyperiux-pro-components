import SuggestedEffectRemixerDemo from "@/components/remixer-panel/SuggestedEffectRemixerDemo";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import registry from "../../../../../../../registry/effects/components/ribbon-drift/registry.json";

export default function Page() {
  return <SuggestedEffectRemixerDemo registry={registry} slug="ribbon-drift" />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("ribbon-drift");
}
