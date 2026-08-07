import SuggestedEffectRemixerDemo from "@/components/remixer-panel/SuggestedEffectRemixerDemo";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import registry from "../../../../../../../registry/effects/cursor/inertia-img/registry.json";

export default function Page() {
  return <SuggestedEffectRemixerDemo registry={registry} slug="inertia-img" />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("inertia-img");
}
