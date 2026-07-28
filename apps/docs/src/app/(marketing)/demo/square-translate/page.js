import SuggestedEffectRemixerDemo from "@/components/remixer-panel/SuggestedEffectRemixerDemo";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import registry from "../../../../../../../registry/effects/scroll/square-translate/registry.json";

export default function Page() {
  return <SuggestedEffectRemixerDemo registry={registry} slug="square-translate" />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("square-translate");
}
