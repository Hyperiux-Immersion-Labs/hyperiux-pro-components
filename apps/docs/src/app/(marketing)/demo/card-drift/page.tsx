import SuggestedEffectRemixerDemo from "@/components/remixer-panel/SuggestedEffectRemixerDemo";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import registry from "../../../../../../../registry/effects/components/card-drift/registry.json";

export default function Page() {
  return <SuggestedEffectRemixerDemo registry={registry} slug="card-drift" />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("card-drift");
}
