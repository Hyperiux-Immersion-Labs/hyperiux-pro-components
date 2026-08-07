import SuggestedEffectRemixerDemo from "@/components/remixer-panel/SuggestedEffectRemixerDemo";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import registry from "../../../../../../../registry/effects/webgl/hyperiux-glitter/registry.json";

export default function Page() {
  return <SuggestedEffectRemixerDemo registry={registry} slug="hyperiux-glitter" />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("hyperiux-glitter");
}
