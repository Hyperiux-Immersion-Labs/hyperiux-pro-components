import SuggestedEffectRemixerDemo from "@/components/remixer-panel/SuggestedEffectRemixerDemo";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import registry from "../../../../../../../registry/effects/scroll/scroll-stack/registry.json";

export default function Page() {
  return <SuggestedEffectRemixerDemo registry={registry} slug="scroll-stack" />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("scroll-stack");
}
