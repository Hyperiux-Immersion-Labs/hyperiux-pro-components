import SuggestedEffectRemixerDemo from "@/components/remixer-panel/SuggestedEffectRemixerDemo";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import registry from "../../../../../../../registry/effects/components/gooey-counter/registry.json";

export default function Page() {
  return <SuggestedEffectRemixerDemo registry={registry} slug="gooey-counter" />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("gooey-counter");
}
