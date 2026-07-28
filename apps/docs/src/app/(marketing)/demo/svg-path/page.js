import SuggestedEffectRemixerDemo from "@/components/remixer-panel/SuggestedEffectRemixerDemo";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import registry from "../../../../../../../registry/effects/scroll/svg-path/registry.json";

export default function Page() {
  return <SuggestedEffectRemixerDemo registry={registry} slug="svg-path" />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("svg-path");
}
