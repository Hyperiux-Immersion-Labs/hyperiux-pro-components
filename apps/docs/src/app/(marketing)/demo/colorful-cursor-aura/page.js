import SuggestedEffectRemixerDemo from "@/components/remixer-panel/SuggestedEffectRemixerDemo";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import registry from "../../../../../../../registry/effects/cursor/colorful-cursor-aura/registry.json";

export default function Page() {
  return <SuggestedEffectRemixerDemo registry={registry} slug="colorful-cursor-aura" />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("colorful-cursor-aura");
}
