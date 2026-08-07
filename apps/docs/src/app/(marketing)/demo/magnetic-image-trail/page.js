import SuggestedEffectRemixerDemo from "@/components/remixer-panel/SuggestedEffectRemixerDemo";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import registry from "../../../../../../../registry/effects/cursor/magnetic-image-trail/registry.json";

export default function Page() {
  return <SuggestedEffectRemixerDemo registry={registry} slug="magnetic-image-trail" />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("magnetic-image-trail");
}
