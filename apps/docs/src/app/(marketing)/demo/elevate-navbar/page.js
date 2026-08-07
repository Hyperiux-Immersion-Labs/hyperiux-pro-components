import SuggestedEffectRemixerDemo from "@/components/remixer-panel/SuggestedEffectRemixerDemo";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import registry from "../../../../../../../registry/effects/navigation/elevate-navbar/registry.json";

export default function Page() {
  return <SuggestedEffectRemixerDemo registry={registry} slug="elevate-navbar" />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("elevate-navbar");
}
