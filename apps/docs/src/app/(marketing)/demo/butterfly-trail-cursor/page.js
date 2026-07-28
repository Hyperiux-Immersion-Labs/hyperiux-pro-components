import SuggestedEffectRemixerDemo from "@/components/remixer-panel/SuggestedEffectRemixerDemo";
import { getDemoPageMetadata } from "@/lib/demo-metadata";
import registry from "../../../../../../../registry/effects/cursor/butterfly-trail-cursor/registry.json";

export default function Page() {
  return <SuggestedEffectRemixerDemo registry={registry} slug="butterfly-trail-cursor" />;
}

export async function generateMetadata() {
  return getDemoPageMetadata("butterfly-trail-cursor");
}
