import SuggestedEffectRemixerDemo from "@/components/remixer-panel/SuggestedEffectRemixerDemo";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import registry from "../../../../../../../registry/effects/components/interactive-list-preview/registry.json";

export default function Page() {
  return <SuggestedEffectRemixerDemo registry={registry} slug="interactive-list-preview" />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("interactive-list-preview");
}
